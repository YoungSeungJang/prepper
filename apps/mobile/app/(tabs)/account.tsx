import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../lib/auth-context';

export default function AccountScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const email = session?.user.email ?? '소셜 계정';

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>내 정보</Text>
        <Text style={styles.title}>계정과 앱 설정을 관리해요.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>로그인 계정</Text>
        <Text style={styles.panelValue}>{email}</Text>
      </View>

      <Pressable onPress={handleSignOut} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 20,
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
  panel: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#ead9cc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 18,
  },
  panelLabel: {
    color: '#8f4d31',
    fontSize: 13,
    fontWeight: '800',
  },
  panelValue: {
    color: '#241812',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d8c6b9',
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#8f4d31',
    fontSize: 16,
    fontWeight: '800',
  },
});
