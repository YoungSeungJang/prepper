import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { importRecipeFromUrl } from '../../lib/api';

export default function ImportScreen() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');

  async function handleSubmit() {
    const trimmedUrl = sourceUrl.trim();

    if (!trimmedUrl) {
      setErrorMessage('가져올 레시피 링크를 입력해주세요.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await importRecipeFromUrl(trimmedUrl);
      setSourceUrl('');
      router.push({
        pathname: '/recipes/[id]',
        params: { id: result.recipeId },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '레시피를 가져오지 못했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>레시피 가져오기</Text>
        <Text style={styles.title}>보고 있던 레시피 링크를 저장해요.</Text>
        <Text style={styles.description}>
          YouTube나 웹페이지 주소를 붙여넣으면 내 레시피로 정리합니다.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>레시피 URL</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          keyboardType="url"
          onChangeText={setSourceUrl}
          placeholder="https://..."
          placeholderTextColor="#a7978d"
          returnKeyType="go"
          style={styles.input}
          value={sourceUrl}
          onSubmitEditing={handleSubmit}
        />
        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}
        <Pressable
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isSubmitting) && styles.primaryButtonPressed,
          ]}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fffaf3" />
          ) : (
            <Text style={styles.primaryButtonText}>가져오기</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 28,
    padding: 20,
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
  description: {
    color: '#6f6259',
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 12,
  },
  label: {
    color: '#4d4038',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#241812',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  errorMessage: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#241812',
  },
  primaryButtonPressed: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: '#fffaf3',
    fontSize: 16,
    fontWeight: '800',
  },
});
