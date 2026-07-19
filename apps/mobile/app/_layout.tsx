import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../lib/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#fffaf3' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fffaf3' },
          headerTitleStyle: { color: '#241812' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recipes/[id]"
          options={{ animation: 'none', title: '레시피' }}
        />
        <Stack.Screen
          name="recipes/[id]/edit"
          options={{ animation: 'none', title: '레시피 편집' }}
        />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
