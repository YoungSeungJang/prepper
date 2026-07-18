import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../lib/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithProvider } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<
    'google' | 'kakao' | null
  >(null);

  async function handleSocialLogin(provider: 'google' | 'kakao') {
    setErrorMessage(null);
    setPendingProvider(provider);

    try {
      const didSignIn = await signInWithProvider(provider);

      if (didSignIn) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '로그인 중 문제가 발생했습니다.',
      );
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <Text style={styles.logo}>Prepper</Text>
          <Text style={styles.title}>내 레시피를 한 곳에 모아두세요.</Text>
          <Text style={styles.subtitle}>
            영상, 블로그, 메모로 흩어진 레시피를 저장하고 장보기 전 바로
            꺼내볼 수 있어요.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>소셜 계정으로 시작하기</Text>
          <Text style={styles.formDescription}>
            웹에서 쓰던 카카오 또는 Google 계정으로 그대로 로그인합니다.
          </Text>
          <Pressable
            disabled={pendingProvider !== null}
            onPress={() => handleSocialLogin('kakao')}
            style={[
              styles.authButton,
              styles.kakaoButton,
              pendingProvider !== null && styles.disabledButton,
            ]}
          >
            <Text style={styles.kakaoButtonText}>
              {pendingProvider === 'kakao'
                ? '카카오 로그인 중...'
                : '카카오로 계속하기'}
            </Text>
          </Pressable>
          <Pressable
            disabled={pendingProvider !== null}
            onPress={() => handleSocialLogin('google')}
            style={[
              styles.authButton,
              styles.googleButton,
              pendingProvider !== null && styles.disabledButton,
            ]}
          >
            <Text style={styles.googleButtonText}>
              {pendingProvider === 'google'
                ? 'Google 로그인 중...'
                : 'Google로 계속하기'}
            </Text>
          </Pressable>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fffaf3',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 88,
  },
  brandBlock: {
    gap: 14,
  },
  logo: {
    color: '#b85c38',
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    color: '#241812',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 42,
  },
  subtitle: {
    color: '#6f6259',
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 12,
  },
  formTitle: {
    color: '#241812',
    fontSize: 20,
    fontWeight: '900',
  },
  formDescription: {
    color: '#6f6259',
    fontSize: 14,
    lineHeight: 21,
    paddingBottom: 4,
  },
  authButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  kakaoButton: {
    backgroundColor: '#fee500',
  },
  kakaoButtonText: {
    color: '#191919',
    fontSize: 16,
    fontWeight: '800',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#d8c6b9',
    backgroundColor: '#fff',
  },
  googleButtonText: {
    color: '#4d4038',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.62,
  },
  errorMessage: {
    alignSelf: 'center',
    color: '#b42318',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    paddingTop: 4,
    textAlign: 'center',
  },
});
