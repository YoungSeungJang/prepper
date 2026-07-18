import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { listRecipes, type RecipeSummary } from '../../lib/api';

type RecipeTab = 'saved' | 'needs_review';

function statusLabel(status: RecipeSummary['status']) {
  return status === 'needs_review' ? '검토 필요' : '저장됨';
}

function recipeMeta(recipe: RecipeSummary) {
  const source = recipe.sourceType === 'youtube' ? 'YouTube' : '웹';
  return `${statusLabel(recipe.status)} · ${source} · ${recipe.servings}`;
}

export default function RecipesScreen() {
  const [activeTab, setActiveTab] = useState<RecipeTab>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);

  async function loadRecipes({ refreshing = false } = {}) {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await listRecipes();
      setRecipes(data.recipes);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '레시피를 불러오지 못했습니다.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadRecipes();
  }, []);

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
    <FlatList
      contentContainerStyle={styles.content}
      data={visibleRecipes}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.eyebrow}>내 레시피</Text>
          <Text style={styles.title}>오늘 만들 레시피를 바로 찾아요.</Text>
          {isLoading ? (
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
          refreshing={isRefreshing}
          tintColor="#b85c38"
          onRefresh={() => loadRecipes({ refreshing: true })}
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
            <Text style={styles.cardMeta}>{recipeMeta(item)}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>
              {activeTab === 'saved'
                ? item.reason
                : '제목, 재료, 조리순서를 확인하고 저장할 수 있어요.'}
            </Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
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
    gap: 8,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 18,
  },
  pendingCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1c3a9',
    borderRadius: 8,
    backgroundColor: '#fff7f1',
    padding: 18,
  },
  pendingMeta: {
    color: '#b85c38',
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    color: '#8f4d31',
    fontSize: 13,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#241812',
    fontSize: 20,
    fontWeight: '900',
  },
  cardDescription: {
    color: '#6f6259',
    fontSize: 15,
    lineHeight: 22,
  },
});
