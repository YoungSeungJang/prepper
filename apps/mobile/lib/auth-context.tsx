import type { Provider, Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

type SocialProvider = Extract<Provider, 'google' | 'kakao'>;

type AuthContextValue = {
  isLoading: boolean;
  session: Session | null;
  signInWithProvider: (provider: SocialProvider) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const redirectTo = 'prepper://auth/callback';
let pendingCallbackPromise: Promise<Session | null> | null = null;
const completedCallbackUrls = new Set<string>();

function getAuthCallbackParams(callbackUrl: string) {
  const url = new URL(callbackUrl);
  const params = new URLSearchParams(url.search);

  if (url.hash) {
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

    for (const [key, value] of hashParams.entries()) {
      params.set(key, value);
    }
  }

  return params;
}

export async function completeOAuthCallback(callbackUrl: string) {
  if (completedCallbackUrls.has(callbackUrl)) {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  if (pendingCallbackPromise) {
    return pendingCallbackPromise;
  }

  pendingCallbackPromise = (async () => {
    const callbackParams = getAuthCallbackParams(callbackUrl);
    const callbackError =
      callbackParams.get('error_description') ?? callbackParams.get('error');

    if (callbackError) {
      throw new Error(callbackError);
    }

    const code = callbackParams.get('code');

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }

      completedCallbackUrls.add(callbackUrl);
      return data.session;
    }

    const accessToken = callbackParams.get('access_token');
    const refreshToken = callbackParams.get('refresh_token');

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        throw error;
      }

      completedCallbackUrls.add(callbackUrl);
      return data.session;
    }

    throw new Error('로그인 정보를 찾을 수 없습니다. 다시 시도해 주세요.');
  })();

  try {
    return await pendingCallbackPromise;
  } finally {
    pendingCallbackPromise = null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession) {
        queryClient.clear();
      }
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      signInWithProvider: async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          throw error;
        }

        if (!data.url) {
          throw new Error('OAuth 로그인 URL을 만들 수 없습니다.');
        }

        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo,
        );

        if (result.type !== 'success') {
          return false;
        }

        const nextSession = await completeOAuthCallback(result.url);
        setSession(nextSession);
        return true;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        queryClient.clear();
      },
    }),
    [isLoading, queryClient, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }

  return context;
}
