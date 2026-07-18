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

function statusLabel(status: RecipeSummary['status']) {
  return status === 'needs_review' ? '검토 필요' : '저장됨';
}

function recipeMeta(recipe: RecipeSummary) {
  const source = recipe.sourceType === 'youtube' ? 'YouTube' : '웹';
  return `${statusLabel(recipe.status)} · ${source} · ${recipe.servings}`;
}

export default function RecipesScreen() {
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

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={recipes}
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
        </View>
      }
      ListEmptyComponent={
        !isLoading && !errorMessage ? (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyTitle}>저장된 레시피가 없어요.</Text>
            <Text style={styles.emptyDescription}>
              웹에서 저장한 레시피나 앱에서 가져온 레시피가 여기에 표시됩니다.
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
        <Link asChild href={`/recipes/${item.id}`}>
          <Pressable style={styles.card}>
            <Text style={styles.cardMeta}>{recipeMeta(item)}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.reason}</Text>
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
