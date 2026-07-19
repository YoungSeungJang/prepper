import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ColorValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../lib/auth-context';

type TabIconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: TabIconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons color={String(color)} name={name} size={size} />
  );
}

export default function TabsLayout() {
  const { isLoading, session } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = Math.max(insets.bottom, 12);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#b85c38" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#fffaf3' },
        headerTitleStyle: { color: '#241812', fontWeight: '800' },
        sceneStyle: { backgroundColor: '#fffaf3' },
        tabBarActiveTintColor: '#b85c38',
        tabBarInactiveTintColor: '#9b8d83',
        tabBarStyle: {
          height: 60 + tabBarBottomPadding,
          borderTopColor: '#ead9cc',
          backgroundColor: '#fffaf3',
          paddingBottom: tabBarBottomPadding,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '레시피',
          tabBarIcon: tabIcon('book-outline'),
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: '가져오기',
          tabBarIcon: tabIcon('add-circle-outline'),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: '내 정보',
          tabBarIcon: tabIcon('person-circle-outline'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf3',
  },
});
