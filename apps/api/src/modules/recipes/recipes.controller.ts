import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/auth.js";
import { importRecipe } from "./recipes-import.service.js";
import type { ImportedRecipeDraft } from "./recipes-import.parser.js";
import { parseRecipeDraftJson } from "./recipes-draft.parser.js";
import type { RecipeRepository, RecipeStatusFilter } from "./recipes.types.js";

function getStatusFilter(value: unknown): RecipeStatusFilter | undefined {
  return value === "saved" || value === "needs_review" ? value : undefined;
}

const fallbackThumbnailUrl = "/recipe-jeyuk.svg";

function isFallbackThumbnailUrl(value: string | undefined) {
  return !value || value === fallbackThumbnailUrl;
}

function getYoutubeVideoId(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);

    if (url.hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/").filter(Boolean)[1] ?? "";
      }

      return url.searchParams.get("v") ?? "";
    }
  } catch {
    return "";
  }

  return "";
}

function getYoutubeThumbnailUrl(sourceUrl: string) {
  const videoId = getYoutubeVideoId(sourceUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;
}

type RecipesControllerDependencies = {
  draftBuilder?: (input: {
    sourceType: "youtube" | "web";
    sourceUrl: string;
  }) => Promise<ImportedRecipeDraft>;
  recipes: RecipeRepository;
};

export function createRecipesController({
  draftBuilder,
  recipes,
}: RecipesControllerDependencies) {
  const listRecipes = async (request: Request, response: Response) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const recipeList = await recipes.listRecipes({
      status: getStatusFilter(authenticatedRequest.query.status),
      token: authenticatedRequest.auth.token,
      userId: authenticatedRequest.auth.user.id,
    });

    response.json({ recipes: recipeList });
  };

  const getRecipe = async (request: Request, response: Response) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const recipeId = authenticatedRequest.params.id;
    if (typeof recipeId !== "string") {
      response.status(404).json({ error: "Recipe not found" });
      return;
    }

    const recipe = await recipes.getRecipe({
      id: recipeId,
      token: authenticatedRequest.auth.token,
      userId: authenticatedRequest.auth.user.id,
    });

    if (!recipe) {
      response.status(404).json({ error: "Recipe not found" });
      return;
    }

    response.json({ recipe });
  };

  const updateRecipe = async (request: Request, response: Response) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const recipeId = authenticatedRequest.params.id;
    if (typeof recipeId !== "string") {
      response.status(404).json({ error: "Recipe not found" });
      return;
    }

    const draftResult = parseRecipeDraftJson(authenticatedRequest.body);
    if (!draftResult.ok) {
      response.status(400).json({ error: draftResult.message });
      return;
    }

    const recipe = await recipes.getRecipe({
      id: recipeId,
      token: authenticatedRequest.auth.token,
      userId: authenticatedRequest.auth.user.id,
    });

    if (!recipe) {
      response.status(404).json({ error: "Recipe not found" });
      return;
    }

    const draft = { ...draftResult.draft };
    if (draft.sourceType === "youtube" && isFallbackThumbnailUrl(draft.thumbnailUrl)) {
      draft.thumbnailUrl = getYoutubeThumbnailUrl(draft.sourceUrl);
    }
    if (isFallbackThumbnailUrl(draft.thumbnailUrl) && !isFallbackThumbnailUrl(recipe.thumbnailUrl)) {
      draft.thumbnailUrl = recipe.thumbnailUrl;
    }

    await recipes.updateRecipe({
      draft,
      id: recipeId,
      token: authenticatedRequest.auth.token,
      userId: authenticatedRequest.auth.user.id,
    });

    response.json({ recipeId, status: "saved" });
  };

  const deleteRecipe = async (request: Request, response: Response) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const recipeId = authenticatedRequest.params.id;
    if (typeof recipeId !== "string") {
      response.status(404).json({ error: "Recipe not found" });
      return;
    }

    const recipe = await recipes.getRecipe({
      id: recipeId,
      token: authenticatedRequest.auth.token,
      userId: authenticatedRequest.auth.user.id,
    });

    if (!recipe) {
      response.status(404).json({ error: "Recipe not found" });
      return;
    }

    await recipes.deleteRecipe({
      id: recipeId,
      token: authenticatedRequest.auth.token,
      userId: authenticatedRequest.auth.user.id,
    });

    response.status(204).send();
  };

  const startRecipeImport = async (request: Request, response: Response) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const sourceUrl = typeof authenticatedRequest.body?.sourceUrl === "string"
      ? authenticatedRequest.body.sourceUrl
      : "";

    const result = await importRecipe({
      draftBuilder,
      recipes,
      sourceUrl,
      token: authenticatedRequest.auth.token,
      userId: authenticatedRequest.auth.user.id,
    });

    if (result.status === "invalid_url") {
      response.status(400).json({
        error: result.error,
        sourceUrl: result.sourceUrl,
      });
      return;
    }

    if (result.status === "duplicate") {
      response.status(409).json({
        existingStatus: result.existingStatus,
        recipeId: result.recipeId,
        status: result.status,
      });
      return;
    }

    response.status(201).json({
      recipeId: result.recipeId,
      status: result.status,
    });
  };

  return {
    deleteRecipe,
    getRecipe,
    listRecipes,
    startRecipeImport,
    updateRecipe,
  };
}
