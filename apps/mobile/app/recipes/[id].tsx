import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { deleteRecipe, getRecipe, type RecipeSummary } from '../../lib/api';

function ingredientText(recipe: RecipeSummary) {
  return recipe.ingredients.map((ingredient) => ingredient.rawText).join(', ');
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState<RecipeSummary | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    async function loadRecipe() {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const data = await getRecipe(id);

        if (isMounted) {
          setRecipe(data.recipe);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : '레시피를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRecipe();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!id || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteRecipe(id);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        '삭제할 수 없어요',
        error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert('레시피 삭제', '이 레시피를 삭제할까요?', [
      { style: 'cancel', text: '취소' },
      {
        onPress: () => {
          void handleDelete();
        },
        style: 'destructive',
        text: '삭제',
      },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#b85c38" />
      </View>
    );
  }

  if (errorMessage || !recipe) {
    return (
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>레시피를 열 수 없어요</Text>
          <Text style={styles.body}>
            {errorMessage ?? '레시피를 찾지 못했습니다.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {recipe.status === 'needs_review' ? '검토 필요' : '레시피 상세'}
        </Text>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>
          {recipe.sourceType === 'youtube' ? 'YouTube' : '웹'}에서 저장한{' '}
          {recipe.servings} 레시피입니다.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.editButtonPressed,
        ]}
        onPress={() => {
          router.push({
            pathname: '/recipes/[id]/edit',
            params: { id: recipe.id },
          });
        }}
      >
        <Text style={styles.editButtonText}>
          {recipe.status === 'needs_review' ? '검토하고 저장' : '레시피 수정'}
        </Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>재료</Text>
        <Text style={styles.body}>
          {recipe.ingredients.length > 0
            ? ingredientText(recipe)
            : '등록된 재료가 없습니다.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>조리 순서</Text>
        {recipe.steps.length > 0 ? (
          recipe.steps.map((step, index) => (
            <Text key={`${index}-${step}`} style={styles.body}>
              {index + 1}. {step}
            </Text>
          ))
        ) : (
          <Text style={styles.body}>등록된 조리 순서가 없습니다.</Text>
        )}
      </View>

      <Pressable
        disabled={isDeleting}
        style={({ pressed }) => [
          styles.deleteButton,
          (pressed || isDeleting) && styles.deleteButtonPressed,
        ]}
        onPress={confirmDelete}
      >
        {isDeleting ? (
          <ActivityIndicator color="#b42318" />
        ) : (
          <Text style={styles.deleteButtonText}>레시피 삭제</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    padding: 20,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf3',
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: '#b85c38',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: '#241812',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
  },
  description: {
    color: '#6f6259',
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    gap: 10,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 18,
  },
  sectionTitle: {
    color: '#241812',
    fontSize: 18,
    fontWeight: '900',
  },
  body: {
    color: '#6f6259',
    fontSize: 16,
    lineHeight: 24,
  },
  editButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#241812',
  },
  editButtonPressed: {
    opacity: 0.74,
  },
  editButtonText: {
    color: '#fffaf3',
    fontSize: 16,
    fontWeight: '800',
  },
  deleteButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f4b5ac',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#b42318',
    fontSize: 16,
    fontWeight: '800',
  },
});
