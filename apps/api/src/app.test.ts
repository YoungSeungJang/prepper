import { EventEmitter } from "node:events";
import { createRequest, createResponse } from "node-mocks-http";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app";
import type { RecipeRepository } from "./modules/recipes/recipes.types";

function createRecipes(overrides: Partial<RecipeRepository> = {}): RecipeRepository {
  return {
    createRecipe: vi.fn(),
    createReviewDraft: vi.fn(),
    deleteRecipe: vi.fn(),
    findRecipeBySourceUrl: vi.fn(),
    getRecipe: vi.fn(),
    listRecipes: vi.fn(),
    updateRecipe: vi.fn(),
    ...overrides,
  };
}

async function callApp(
  app: ReturnType<typeof createApp>,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
    method: string;
    url: string;
  },
) {
  const request = createRequest(options);
  const response = createResponse({
    eventEmitter: EventEmitter,
  });

  const responseEnded = new Promise<void>((resolve) => {
    response.on("end", resolve);
  });
  app.handle(request, response);
  await responseEnded;
  const responseBody = response._getData();

  return {
    body: responseBody ? response._getJSONData() : undefined,
    status: response.statusCode,
  };
}

describe("api app", () => {
  it("returns health without authentication", async () => {
    const app = createApp({
      auth: {
        getUser: vi.fn(),
      },
      recipes: createRecipes(),
    });

    const response = await callApp(app, {
      method: "GET",
      url: "/health",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects /me when the bearer token is missing", async () => {
    const app = createApp({
      auth: {
        getUser: vi.fn(),
      },
      recipes: createRecipes(),
    });

    const response = await callApp(app, {
      method: "GET",
      url: "/me",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("returns the current user for a valid bearer token", async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });
    const app = createApp({
      auth: {
        getUser,
      },
      recipes: createRecipes(),
    });

    const response = await callApp(app, {
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "GET",
      url: "/me",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
    });
    expect(getUser).toHaveBeenCalledWith("valid-token");
  });

  it("rejects /recipes when the bearer token is missing", async () => {
    const app = createApp({
      auth: {
        getUser: vi.fn(),
      },
      recipes: createRecipes(),
    });

    const response = await callApp(app, {
      method: "GET",
      url: "/recipes",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("returns recipes for the authenticated user", async () => {
    const listRecipes = vi.fn().mockResolvedValue([
      {
        id: "recipe-1",
        title: "Jeyuk",
      },
    ]);
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes({
        listRecipes,
      }),
    });

    const response = await callApp(app, {
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "GET",
      url: "/recipes?status=saved",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      recipes: [
        {
          id: "recipe-1",
          title: "Jeyuk",
        },
      ],
    });
    expect(listRecipes).toHaveBeenCalledWith({
      status: "saved",
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("returns one recipe for the authenticated user", async () => {
    const getRecipe = vi.fn().mockResolvedValue({
      id: "recipe-1",
      title: "Jeyuk",
    });
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes({
        getRecipe,
      }),
    });

    const response = await callApp(app, {
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "GET",
      url: "/recipes/recipe-1",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      recipe: {
        id: "recipe-1",
        title: "Jeyuk",
      },
    });
    expect(getRecipe).toHaveBeenCalledWith({
      id: "recipe-1",
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("returns not found when the recipe does not exist", async () => {
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes({
        getRecipe: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await callApp(app, {
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "GET",
      url: "/recipes/missing-recipe",
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Recipe not found" });
  });

  it("updates recipe drafts for the authenticated user", async () => {
    const updateRecipe = vi.fn().mockResolvedValue(undefined);
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes({
        getRecipe: vi.fn().mockResolvedValue({
          id: "recipe-1",
          title: "검토 초안",
        }),
        updateRecipe,
      }),
    });

    const response = await callApp(app, {
      body: {
        ingredients: [
          { rawText: "김치 1컵", importance: "primary" },
          { rawText: "두부 1모", importance: "secondary" },
        ],
        servings: "2인분",
        sourceType: "web",
        sourceUrl: "https://example.com/recipe",
        steps: ["김치를 볶는다.", "물을 붓고 끓인다."],
        title: "김치찌개",
      },
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "PATCH",
      url: "/recipes/recipe-1",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      recipeId: "recipe-1",
      status: "saved",
    });
    expect(updateRecipe).toHaveBeenCalledWith({
      draft: {
        ingredients: [
          { rawText: "김치 1컵", importance: "primary" },
          { rawText: "두부 1모", importance: "secondary" },
        ],
        servings: "2인분",
        sourceType: "web",
        sourceUrl: "https://example.com/recipe",
        steps: [
          { position: 1, body: "김치를 볶는다." },
          { position: 2, body: "물을 붓고 끓인다." },
        ],
        title: "김치찌개",
      },
      id: "recipe-1",
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("rejects invalid recipe draft updates", async () => {
    const updateRecipe = vi.fn();
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes({
        getRecipe: vi.fn().mockResolvedValue({
          id: "recipe-1",
          title: "검토 초안",
        }),
        updateRecipe,
      }),
    });

    const response = await callApp(app, {
      body: {
        ingredients: [],
        sourceUrl: "https://example.com/recipe",
        steps: ["끓인다."],
        title: "김치찌개",
      },
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "PATCH",
      url: "/recipes/recipe-1",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "재료를 최소 1개 입력해 주세요." });
    expect(updateRecipe).not.toHaveBeenCalled();
  });

  it("deletes recipes for the authenticated user", async () => {
    const deleteRecipe = vi.fn().mockResolvedValue(undefined);
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes({
        deleteRecipe,
        getRecipe: vi.fn().mockResolvedValue({
          id: "recipe-1",
          title: "김치찌개",
        }),
      }),
    });

    const response = await callApp(app, {
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "DELETE",
      url: "/recipes/recipe-1",
    });

    expect(response.status).toBe(204);
    expect(response.body).toBeUndefined();
    expect(deleteRecipe).toHaveBeenCalledWith({
      id: "recipe-1",
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("rejects invalid recipe import URLs", async () => {
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes(),
    });

    const response = await callApp(app, {
      body: {
        sourceUrl: "not a url",
      },
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "POST",
      url: "/recipes/import",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "올바른 링크가 아니에요",
      sourceUrl: "not a url",
    });
  });

  it("returns duplicate import results", async () => {
    const findRecipeBySourceUrl = vi.fn().mockResolvedValue({
      id: "recipe-1",
      status: "saved",
    });
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      recipes: createRecipes({
        findRecipeBySourceUrl,
      }),
    });

    const response = await callApp(app, {
      body: {
        sourceUrl: "https://example.com/recipe",
      },
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "POST",
      url: "/recipes/import",
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      existingStatus: "saved",
      recipeId: "recipe-1",
      status: "duplicate",
    });
    expect(findRecipeBySourceUrl).toHaveBeenCalledWith({
      sourceUrl: "https://example.com/recipe",
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("creates review drafts for complete imports", async () => {
    const draft = {
      title: "김치찌개",
      sourceUrl: "https://example.com/recipe",
      sourceType: "web" as const,
      ingredients: [
        { rawText: "김치 1컵", importance: "primary" as const },
        { rawText: "두부 1모", importance: "secondary" as const },
      ],
      steps: [
        { position: 1, body: "김치를 볶는다." },
        { position: 2, body: "물을 붓고 끓인다." },
      ],
      parseConfidence: 0.8,
      parseWarnings: [],
    };
    const createRecipe = vi.fn();
    const createReviewDraft = vi.fn().mockResolvedValue("recipe-1");
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      draftBuilder: vi.fn().mockResolvedValue(draft),
      recipes: createRecipes({
        createRecipe,
        createReviewDraft,
        findRecipeBySourceUrl: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await callApp(app, {
      body: {
        sourceUrl: "https://example.com/recipe",
      },
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "POST",
      url: "/recipes/import",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      recipeId: "recipe-1",
      status: "needs_review",
    });
    expect(createRecipe).not.toHaveBeenCalled();
    expect(createReviewDraft).toHaveBeenCalledWith({
      draft,
      parseConfidence: 0.8,
      parseWarnings: [],
      sourceVideoId: undefined,
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("creates review drafts for incomplete imports", async () => {
    const draft = {
      title: "쇼츠 레시피",
      sourceUrl: "https://www.youtube.com/watch?v=abc123",
      sourceType: "youtube" as const,
      ingredients: [{ rawText: "재료를 확인해 주세요", importance: "primary" as const }],
      steps: [{ position: 1, body: "원문을 보고 조리 순서를 확인해 주세요." }],
      parseConfidence: 0.2,
      parseWarnings: ["재료를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요."],
    };
    const createReviewDraft = vi.fn().mockResolvedValue("recipe-2");
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      draftBuilder: vi.fn().mockResolvedValue(draft),
      recipes: createRecipes({
        createReviewDraft,
        findRecipeBySourceUrl: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await callApp(app, {
      body: {
        sourceUrl: "https://www.youtube.com/watch?v=abc123",
      },
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "POST",
      url: "/recipes/import",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      recipeId: "recipe-2",
      status: "needs_review",
    });
    expect(createReviewDraft).toHaveBeenCalledWith({
      draft,
      parseConfidence: 0.2,
      parseWarnings: ["재료를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요."],
      sourceVideoId: "abc123",
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("returns JSON when recipe import fails unexpectedly", async () => {
    const app = createApp({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      },
      draftBuilder: vi.fn().mockResolvedValue({
        title: "웹 레시피",
        sourceUrl: "https://example.com/recipe",
        sourceType: "web",
        ingredients: [{ rawText: "재료를 확인해 주세요", importance: "primary" }],
        steps: [{ position: 1, body: "원문을 보고 조리 순서를 확인해 주세요." }],
        parseConfidence: 0.2,
        parseWarnings: ["링크 내용을 가져오지 못했어요."],
      }),
      recipes: createRecipes({
        createReviewDraft: vi.fn().mockRejectedValue(new Error("insert failed")),
        findRecipeBySourceUrl: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await callApp(app, {
      body: {
        sourceUrl: "https://example.com/recipe",
      },
      headers: {
        Authorization: "Bearer valid-token",
      },
      method: "POST",
      url: "/recipes/import",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "요청을 처리하지 못했습니다. 서버 로그를 확인해 주세요.",
    });
  });
});
