import { mobileEnv } from './env';
import { supabase } from './supabase';

type ApiResponse<T> = T | { error: string };
const apiBaseUrl = mobileEnv.apiUrl.replace(/\/$/, '');

type RequestApiOptions = {
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
};

export type RecipeSummary = {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: 'youtube' | 'web';
  thumbnailUrl: string;
  servings: string;
  status: 'saved' | 'needs_review';
  createdAt: string;
  reason: string;
  priceHint: {
    band: 'cheap' | 'normal' | 'expensive' | 'unknown';
    summary: string;
    confidence: 'high' | 'medium' | 'low';
  };
  ingredients: Array<{
    rawText: string;
    importance: 'primary' | 'secondary' | 'seasoning';
  }>;
  steps: string[];
  warnings?: string[];
};

async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error('로그인이 필요합니다.');
  }

  return session.access_token;
}

async function requestApi<T>(path: string, options: RequestApiOptions = {}) {
  const token = await getAccessToken();
  const method = options.method ?? 'GET';
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const responseText = await response.text();
  const payload = responseText
    ? (JSON.parse(responseText) as ApiResponse<T>)
    : undefined;

  if (!response.ok) {
    throw new Error(isApiError(payload) ? payload.error : '요청에 실패했습니다.');
  }

  return payload as T;
}

function isApiError(payload: unknown): payload is { error: string } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  );
}

export async function listRecipes() {
  return requestApi<{ recipes: RecipeSummary[] }>('/recipes');
}

export async function getRecipe(id: string) {
  return requestApi<{ recipe: RecipeSummary }>(
    `/recipes/${encodeURIComponent(id)}`,
  );
}

export async function importRecipeFromUrl(sourceUrl: string) {
  return requestApi<{
    recipeId: string;
    status: 'saved' | 'needs_review' | 'duplicate';
  }>('/recipes/import', {
    body: { sourceUrl },
    method: 'POST',
  });
}

export async function deleteRecipe(id: string) {
  return requestApi<void>(`/recipes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
