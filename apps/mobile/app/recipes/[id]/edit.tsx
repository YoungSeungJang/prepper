import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  deleteRecipe,
  getRecipe,
  updateRecipe,
  type RecipeSummary,
} from '../../../lib/api';

const stepLabels = ['제목', '재료', '조리순서'];

function cleanRows(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function withTrailingBlank(values: string[]) {
  const cleaned = cleanRows(values);
  return [...cleaned, ''];
}

function TextRowInput({
  editable,
  index,
  multiline = false,
  onChange,
  placeholder,
  value,
}: {
  editable: boolean;
  index: number;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.rowInput}>
      <Text style={styles.rowIndex}>{index + 1}</Text>
      <TextInput
        editable={editable}
        multiline={multiline}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#a7978d"
        style={[styles.input, multiline && styles.stepInput]}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
      />
    </View>
  );
}

export default function RecipeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const actionBarBottomPadding = Math.max(insets.bottom, 16);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState(['']);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [recipe, setRecipe] = useState<RecipeSummary | null>(null);
  const [steps, setSteps] = useState(['']);
  const [title, setTitle] = useState('');

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
          setTitle(data.recipe.title);
          setIngredients(
            withTrailingBlank(
              data.recipe.ingredients.map((ingredient) => ingredient.rawText),
            ),
          );
          setSteps(withTrailingBlank(data.recipe.steps));
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

  async function handleSave() {
    if (!id || !recipe || isSaving || isDeleting) {
      return;
    }

    const cleanedIngredients = cleanRows(ingredients);
    const cleanedSteps = cleanRows(steps);

    if (!title.trim()) {
      setErrorMessage('제목을 입력해주세요.');
      return;
    }

    if (cleanedIngredients.length === 0) {
      setErrorMessage('재료를 최소 1개 입력해주세요.');
      return;
    }

    if (cleanedSteps.length === 0) {
      setErrorMessage('조리순서를 최소 1개 입력해주세요.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await updateRecipe(id, {
        ingredients: cleanedIngredients,
        servings: recipe.servings || undefined,
        sourceType: recipe.sourceType,
        sourceUrl: recipe.sourceUrl,
        steps: cleanedSteps,
        title: title.trim(),
      });
      router.replace({
        pathname: '/recipes/[id]',
        params: { id },
      });
    } catch (error) {
      Alert.alert(
        '저장할 수 없어요',
        error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    if (!id || isSaving || isDeleting) {
      return;
    }

    Alert.alert(
      recipe?.status === 'needs_review'
        ? '미완성 레시피를 삭제할까요?'
        : '레시피를 삭제할까요?',
      '삭제한 레시피는 다시 되돌릴 수 없어요.',
      [
        { style: 'cancel', text: '취소' },
        {
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteRecipe(id);
              router.replace('/(tabs)');
            } catch (error) {
              Alert.alert(
                '삭제할 수 없어요',
                error instanceof Error
                  ? error.message
                  : '잠시 후 다시 시도해주세요.',
              );
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive',
          text: '삭제',
        },
      ],
    );
  }

  function canGoNext() {
    if (currentStep === 0) {
      return Boolean(title.trim());
    }

    if (currentStep === 1) {
      return cleanRows(ingredients).length > 0;
    }

    return cleanRows(steps).length > 0;
  }

  function handleNext() {
    if (!canGoNext()) {
      if (currentStep === 0) {
        setErrorMessage('제목을 입력해주세요.');
      } else if (currentStep === 1) {
        setErrorMessage('재료를 최소 1개 입력해주세요.');
      } else {
        setErrorMessage('조리순서를 최소 1개 입력해주세요.');
      }
      return;
    }

    setErrorMessage(null);
    setCurrentStep((step) => Math.min(step + 1, stepLabels.length - 1));
  }

  function setIngredient(index: number, value: string) {
    setIngredients((current) =>
      withTrailingBlank(
        current.map((ingredient, ingredientIndex) =>
          ingredientIndex === index ? value : ingredient,
        ),
      ),
    );
  }

  function setRecipeStep(index: number, value: string) {
    setSteps((current) =>
      withTrailingBlank(
        current.map((recipeStep, recipeStepIndex) =>
          recipeStepIndex === index ? value : recipeStep,
        ),
      ),
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#b85c38" />
      </View>
    );
  }

  if (!recipe) {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 86 + actionBarBottomPadding },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            {recipe.status === 'needs_review' ? '검토 필요' : '레시피 수정'}
          </Text>
          <Text style={styles.title}>{stepLabels[currentStep]}</Text>
        </View>

        <View style={styles.progressRow}>
          {stepLabels.map((label, index) => (
            <View
              key={label}
              style={[
                styles.progressPill,
                index <= currentStep && styles.progressPillActive,
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  index <= currentStep && styles.progressTextActive,
                ]}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}

        {currentStep === 0 ? (
          <View style={styles.section}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              editable={!isSaving && !isDeleting}
              onChangeText={setTitle}
              placeholder="레시피 제목"
              placeholderTextColor="#a7978d"
              style={styles.input}
              value={title}
            />
          </View>
        ) : null}

        {currentStep === 1 ? (
          <View style={styles.section}>
            <Text style={styles.label}>재료</Text>
            {ingredients.map((ingredient, index) => (
              <TextRowInput
                editable={!isSaving && !isDeleting}
                index={index}
                key={`ingredient-${index}`}
                onChange={(value) => setIngredient(index, value)}
                placeholder="예: 김치 1컵"
                value={ingredient}
              />
            ))}
          </View>
        ) : null}

        {currentStep === 2 ? (
          <View style={styles.section}>
            <Text style={styles.label}>조리순서</Text>
            {steps.map((recipeStep, index) => (
              <TextRowInput
                editable={!isSaving && !isDeleting}
                index={index}
                key={`step-${index}`}
                multiline
                onChange={(value) => setRecipeStep(index, value)}
                placeholder="예: 팬에 기름을 두르고 김치를 볶는다."
                value={recipeStep}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.actionBar,
          { paddingBottom: actionBarBottomPadding },
        ]}
      >
        <View style={styles.buttonRow}>
          {currentStep === 0 ? (
            <Pressable
              disabled={isSaving || isDeleting}
              style={({ pressed }) => [
                styles.deleteButton,
                (pressed || isDeleting) && styles.deleteButtonPressed,
              ]}
              onPress={handleDelete}
            >
              {isDeleting ? (
                <ActivityIndicator color="#b42318" />
              ) : (
                <Text style={styles.deleteButtonText}>레시피 삭제</Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              disabled={isSaving || isDeleting}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
              onPress={() => {
                setErrorMessage(null);
                setCurrentStep((step) => Math.max(step - 1, 0));
              }}
            >
              <Text style={styles.secondaryButtonText}>이전</Text>
            </Pressable>
          )}

          <Pressable
            disabled={isSaving || isDeleting}
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || isSaving) && styles.saveButtonPressed,
            ]}
            onPress={currentStep === stepLabels.length - 1 ? handleSave : handleNext}
          >
            {isSaving ? (
              <ActivityIndicator color="#fffaf3" />
            ) : (
              <Text style={styles.saveButtonText}>
                {currentStep === stepLabels.length - 1 ? '저장' : '다음'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 16,
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
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressPill: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  progressPillActive: {
    borderColor: '#b85c38',
    backgroundColor: '#fff1e8',
  },
  progressText: {
    color: '#8f8177',
    fontSize: 13,
    fontWeight: '800',
  },
  progressTextActive: {
    color: '#8f4d31',
  },
  errorMessage: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#241812',
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    color: '#4d4038',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#241812',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowIndex: {
    width: 26,
    color: '#8f8177',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 52,
    textAlign: 'center',
  },
  stepInput: {
    minHeight: 72,
    lineHeight: 24,
  },
  body: {
    color: '#6f6259',
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    minHeight: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0b8b8',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#b42318',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBar: {
    borderTopWidth: 1,
    borderTopColor: '#ead9cc',
    backgroundColor: '#fffaf3',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  secondaryButton: {
    minHeight: 54,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  secondaryButtonPressed: {
    opacity: 0.72,
  },
  secondaryButtonText: {
    color: '#4d4038',
    fontSize: 16,
    fontWeight: '800',
  },
  saveButton: {
    minHeight: 54,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#241812',
  },
  saveButtonPressed: {
    opacity: 0.74,
  },
  saveButtonText: {
    color: '#fffaf3',
    fontSize: 16,
    fontWeight: '800',
  },
});
