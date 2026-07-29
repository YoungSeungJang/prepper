import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listRecipes, type RecipeSummary } from '../../lib/api';
import { recipeQueryKeys } from '../../lib/recipe-queries';

type RecipeTab = 'saved' | 'needs_review';

function recipeSourceLabel(recipe: RecipeSummary) {
  return recipe.sourceType === 'youtube' ? 'YouTube에서 저장' : '웹에서 저장';
}

function recipeComplexity(recipe: RecipeSummary) {
  return `재료 ${recipe.ingredients.length}개 · 조리순서 ${recipe.steps.length}단계`;
}

function recipeThumbnailUrl(recipe: RecipeSummary) {
  return recipe.thumbnailUrl.startsWith('http') ? recipe.thumbnailUrl : null;
}

function recipePlaceholderText(recipe: RecipeSummary) {
  return recipe.sourceType === 'youtube' ? 'YT' : 'WEB';
}

export default function RecipesScreen() {
  const params = useLocalSearchParams<{
    recipeSaved?: string;
    savedAt?: string;
  }>();
  const insets = useSafeAreaInsets();
  const shownToastKeyRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<RecipeTab>('saved');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const {
    data,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: listRecipes,
    queryKey: recipeQueryKeys.list,
  });
  const recipes = data?.recipes ?? [];
  const errorMessage = error instanceof Error
    ? error.message
    : error
      ? '레시피를 불러오지 못했습니다.'
      : null;

  useEffect(() => {
    if (params.recipeSaved !== '1') {
      return;
    }

    const toastKey = params.savedAt ?? params.recipeSaved;
    if (shownToastKeyRef.current === toastKey) {
      return;
    }

    shownToastKeyRef.current = toastKey;
    setActiveTab('saved');
    setToastMessage('레시피 카드가 저장됐어요.');

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => {
      clearTimeout(timer);
    };
  }, [params.recipeSaved, params.savedAt]);

  const reviewDrafts = recipes.filter((recipe) => recipe.status === 'needs_review');
  const savedRecipes = recipes.filter((recipe) => recipe.status === 'saved');
  const visibleRecipes = activeTab === 'saved' ? savedRecipes : reviewDrafts;
  const emptyCopy = activeTab === 'saved'
    ? {
        description:
          reviewDrafts.length > 0
            ? '완성 대기 탭의 레시피를 검토하고 저장하면 여기에 표시됩니다.'
            : '웹에서 저장한 레시피나 앱에서 가져온 레시피가 여기에 표시됩니다.',
        title: '저장된 레시피가 없어요.',
      }
    : {
        description: '링크로 가져온 레시피를 완성하지 않으면 여기에 표시됩니다.',
        title: '완성 대기 중인 레시피가 없어요.',
      };

  return (
    <View style={styles.screen}>
      <FlatList
      contentContainerStyle={styles.content}
      data={visibleRecipes}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.eyebrow}>내 레시피</Text>
          <Text style={styles.title}>오늘 만들 레시피를 바로 찾아요.</Text>
          {isLoading || (isFetching && recipes.length === 0) ? (
            <ActivityIndicator color="#b85c38" style={styles.indicator} />
          ) : null}
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          <View style={styles.tabRow}>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === 'saved' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('saved')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'saved' && styles.tabButtonTextActive,
                ]}
              >
                저장됨 {savedRecipes.length}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === 'needs_review' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('needs_review')}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'needs_review' && styles.tabButtonTextActive,
                ]}
              >
                완성 대기 {reviewDrafts.length}
              </Text>
            </Pressable>
          </View>
        </View>
      }
      ListEmptyComponent={
        !isLoading && !errorMessage ? (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyTitle}>{emptyCopy.title}</Text>
            <Text style={styles.emptyDescription}>
              {emptyCopy.description}
            </Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isFetching && recipes.length > 0}
          tintColor="#b85c38"
          onRefresh={() => {
            void refetch();
          }}
        />
      }
      renderItem={({ item }) => (
        <Link
          asChild
          href={{
            pathname: activeTab === 'saved' ? '/recipes/[id]' : '/recipes/[id]/edit',
            params: { id: item.id },
          }}
        >
          <Pressable style={activeTab === 'saved' ? styles.card : styles.pendingCard}>
            <View style={styles.thumbnail}>
              {recipeThumbnailUrl(item) ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: recipeThumbnailUrl(item) ?? undefined }}
                  style={styles.thumbnailImage}
                />
              ) : (
                <View
                  style={[
                    styles.thumbnailPlaceholder,
                    item.sourceType === 'youtube' && styles.youtubePlaceholder,
                  ]}
                >
                  <Text style={styles.thumbnailPlaceholderText}>
                    {recipePlaceholderText(item)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text style={styles.cardSource}>{recipeSourceLabel(item)}</Text>
              <Text style={styles.cardMeta}>{recipeComplexity(item)}</Text>
              {activeTab === 'needs_review' ? (
                <Text style={styles.cardAction}>이어서 완성하기</Text>
              ) : null}
            </View>
          </Pressable>
        </Link>
      )}
      />
      {toastMessage ? (
        <View
          pointerEvents="none"
          style={[
            styles.toast,
            { bottom: 76 + Math.max(insets.bottom, 12) },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 20,
  },
  header: {
    gap: 8,
    paddingBottom: 8,
  },
  eyebrow: {
    color: '#b85c38',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: '#241812',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36,
  },
  indicator: {
    alignSelf: 'flex-start',
    paddingTop: 6,
  },
  errorMessage: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  tabButtonActive: {
    borderColor: '#241812',
    backgroundColor: '#241812',
  },
  tabButtonText: {
    color: '#8f8177',
    fontSize: 14,
    fontWeight: '900',
  },
  tabButtonTextActive: {
    color: '#fffaf3',
  },
  emptyPanel: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 18,
  },
  emptyTitle: {
    color: '#241812',
    fontSize: 18,
    fontWeight: '900',
  },
  emptyDescription: {
    color: '#6f6259',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 14,
  },
  pendingCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1c3a9',
    borderRadius: 8,
    backgroundColor: '#fff7f1',
    padding: 14,
  },
  pendingMeta: {
    color: '#b85c38',
    fontSize: 13,
    fontWeight: '900',
  },
  thumbnail: {
    width: 84,
    height: 84,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#f5e9df',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ead9cc',
  },
  youtubePlaceholder: {
    backgroundColor: '#fff0ea',
  },
  thumbnailPlaceholderText: {
    color: '#8f4d31',
    fontSize: 13,
    fontWeight: '900',
  },
  cardBody: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  cardTitle: {
    color: '#241812',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  cardSource: {
    color: '#8f4d31',
    fontSize: 14,
    fontWeight: '800',
  },
  cardMeta: {
    color: '#6f6259',
    fontSize: 14,
    fontWeight: '700',
  },
  cardAction: {
    alignSelf: 'flex-start',
    color: '#b85c38',
    fontSize: 14,
    fontWeight: '900',
    paddingTop: 2,
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#241812',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toastText: {
    color: '#fffaf3',
    fontSize: 15,
    fontWeight: '800',
  },
});
