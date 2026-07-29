import { mobileEnv } from './env';
import { supabase } from './supabase';

type ApiResponse<T> = T | { error: string };
const apiBaseUrl = mobileEnv.apiUrl.replace(/\/$/, '');

type RequestApiOptions = {
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
};

type RecipeImportResult = {
  existingStatus?: 'saved' | 'needs_review';
  recipeId: string;
  status: 'saved' | 'needs_review' | 'duplicate';
};

class ApiHttpError extends Error {
  payload: unknown;
  status: number;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = 'ApiHttpError';
    this.payload = payload;
    this.status = status;
  }
}

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

export type RecipeUpdateInput = {
  title: string;
  sourceUrl: string;
  sourceType: RecipeSummary['sourceType'];
  thumbnailUrl?: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
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
  const payload = parseApiResponse<T>(responseText);

  if (!response.ok) {
    if (isApiError(payload)) {
      throw new ApiHttpError(response.status, payload.error, payload);
    }

    throw new ApiHttpError(
      response.status,
      `API 요청에 실패했습니다. (${response.status}) 배포 또는 /api 프록시 설정을 확인해주세요.`,
      payload,
    );
  }

  return payload as T;
}

function parseApiResponse<T>(responseText: string): ApiResponse<T> | undefined {
  if (!responseText) {
    return undefined;
  }

  try {
    return JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    return undefined;
  }
}

function isApiError(payload: unknown): payload is { error: string } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  );
}

function isRecipeImportResult(payload: unknown): payload is RecipeImportResult {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const record = payload as Record<string, unknown>;
  return (
    typeof record.recipeId === 'string' &&
    (record.status === 'saved' ||
      record.status === 'needs_review' ||
      record.status === 'duplicate')
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
  try {
    return await requestApi<RecipeImportResult>('/recipes/import', {
      body: { sourceUrl },
      method: 'POST',
    });
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 409) {
      const duplicate = error.payload;

      if (isRecipeImportResult(duplicate) && duplicate.status === 'duplicate') {
        return duplicate;
      }
    }

    throw error;
  }
}

export async function deleteRecipe(id: string) {
  return requestApi<void>(`/recipes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function updateRecipe(id: string, recipe: RecipeUpdateInput) {
  return requestApi<{ recipeId: string; status: 'saved' }>(
    `/recipes/${encodeURIComponent(id)}`,
    {
      body: recipe,
      method: 'PATCH',
    },
  );
}
