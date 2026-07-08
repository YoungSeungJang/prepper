import { EventEmitter } from "node:events";
import { createRequest, createResponse } from "node-mocks-http";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app";

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

  return {
    body: response._getJSONData(),
    status: response.statusCode,
  };
}

describe("api app", () => {
  it("returns health without authentication", async () => {
    const app = createApp({
      auth: {
        getUser: vi.fn(),
      },
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe: vi.fn(),
        listRecipes,
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe,
        listRecipes: vi.fn(),
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe: vi.fn().mockResolvedValue(null),
        listRecipes: vi.fn(),
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn(),
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl,
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
      recipeId: "recipe-1",
      status: "duplicate",
    });
    expect(findRecipeBySourceUrl).toHaveBeenCalledWith({
      sourceUrl: "https://example.com/recipe",
      token: "valid-token",
      userId: "user-1",
    });
  });

  it("saves complete imported recipes", async () => {
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
    const createRecipe = vi.fn().mockResolvedValue("recipe-1");
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
      recipes: {
        createRecipe,
        createReviewDraft: vi.fn(),
        findRecipeBySourceUrl: vi.fn().mockResolvedValue(null),
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
      status: "saved",
    });
    expect(createRecipe).toHaveBeenCalledWith({
      draft,
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
      recipes: {
        createRecipe: vi.fn(),
        createReviewDraft,
        findRecipeBySourceUrl: vi.fn().mockResolvedValue(null),
        getRecipe: vi.fn(),
        listRecipes: vi.fn(),
      },
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
});
