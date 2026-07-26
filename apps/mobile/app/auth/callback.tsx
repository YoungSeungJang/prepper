import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { completeOAuthCallback } from '../../lib/auth-context';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const callbackUrl = Linking.useURL();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!callbackUrl) {
      return;
    }

    let isMounted = true;

    completeOAuthCallback(callbackUrl)
      .then(() => {
        if (isMounted) {
          router.replace('/(tabs)');
        }
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : '로그인 중 문제가 발생했습니다.',
        );
        router.replace('/login');
      });

    return () => {
      isMounted = false;
    };
  }, [callbackUrl, router]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator color="#b85c38" />
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#fffaf3',
    padding: 24,
  },
  errorMessage: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
