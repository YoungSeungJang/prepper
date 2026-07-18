import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { mobileEnv } from './env';

export const supabase = createClient(
  mobileEnv.supabaseUrl,
  mobileEnv.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      lock: processLock,
      persistSession: true,
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    },
  },
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
