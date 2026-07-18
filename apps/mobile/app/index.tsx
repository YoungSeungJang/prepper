import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../lib/auth-context';

export default function HomeScreen() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#b85c38" />
      </View>
    );
  }

  return <Redirect href={session ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf3',
  },
});
