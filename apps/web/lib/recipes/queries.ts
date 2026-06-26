import type { RecipeDraftInput, RecipeStatus, SourceType } from "@prepper/shared";
import { mockRecipes } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { RecipeListItem } from "./types";

type RecipeRow = {
  id: string;
  title: string;
  source_url: string;
  source_type: SourceType;
  source_video_id: string | null;
  thumbnail_url: string | null;
  servings: string | null;
  status: RecipeStatus;
  created_at: string;
  ingredients: Array<{
    raw_text: string;
    importance: "primary" | "secondary" | "seasoning";
  }>;
  recipe_steps: Array<{
    position: number;
    body: string;
  }>;
  parsed_sources?: Array<{
    confidence: number | null;
    warnings: unknown;
  }>;
};

function parseWarnings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function toListItem(row: RecipeRow): RecipeListItem {
  const warnings = (row.parsed_sources ?? []).flatMap((source) =>
    parseWarnings(source.warnings),
  );

  return {
    id: row.id,
    title: row.title,
    sourceUrl: row.source_url,
    sourceType: row.source_type,
    thumbnailUrl: row.thumbnail_url ?? "/recipe-jeyuk.svg",
    servings: row.servings ?? "1인분",
    status: row.status === "needs_review" ? "needs_review" : "saved",
    createdAt: row.created_at,
    reason: "최근 저장한 레시피예요",
    priceHint: {
      band: "unknown",
      summary: "가격 정보 부족",
      confidence: "low",
    },
    ingredients: row.ingredients.map((ingredient) => ({
      rawText: ingredient.raw_text,
      importance: ingredient.importance,
    })),
    steps: row.recipe_steps
      .sort((left, right) => left.position - right.position)
      .map((step) => step.body),
    warnings,
  };
}

export async function listSavedRecipes(): Promise<RecipeListItem[]> {
  const recipes = await listRecipesByStatus("saved");
  return recipes;
}

export async function listReviewDrafts(): Promise<RecipeListItem[]> {
  const recipes = await listRecipesByStatus("needs_review");
  return recipes;
}

async function listRecipesByStatus(status: RecipeStatus): Promise<RecipeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id,title,source_url,source_type,source_video_id,thumbnail_url,servings,status,created_at,ingredients(raw_text,importance),recipe_steps(position,body),parsed_sources(confidence,warnings)",
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list recipes by status", error);
    return [];
  }

  return ((data ?? []) as RecipeRow[]).map(toListItem);
}

export async function countReviewDrafts() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("status", "needs_review");

  if (error) {
    console.error("Failed to count review drafts", error);
    return 0;
  }

  return count ?? 0;
}

export async function getRecipe(id: string): Promise<RecipeListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id,title,source_url,source_type,source_video_id,thumbnail_url,servings,status,created_at,ingredients(raw_text,importance),recipe_steps(position,body),parsed_sources(confidence,warnings)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load recipe", error);
    return null;
  }

  return data ? toListItem(data as RecipeRow) : null;
}

export async function findRecipeBySourceUrl(sourceUrl: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id,status")
    .eq("user_id", userId)
    .eq("source_url", sourceUrl)
    .maybeSingle();

  if (error) {
    console.error("Failed to find recipe by source URL", error);
    return null;
  }

  return data as { id: string; status: RecipeStatus } | null;
}

export async function createRecipe(draft: RecipeDraftInput, userId: string) {
  const supabase = await createClient();
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: userId,
      title: draft.title,
      source_url: draft.sourceUrl,
      source_type: draft.sourceType,
      thumbnail_url: draft.thumbnailUrl ?? "/recipe-jeyuk.svg",
      servings: draft.servings ?? "1인분",
      status: "saved",
    })
    .select("id")
    .single();

  if (recipeError || !recipe) {
    throw recipeError ?? new Error("Recipe insert failed");
  }

  const recipeId = recipe.id as string;

  if (draft.ingredients.length > 0) {
    const { error } = await supabase.from("ingredients").insert(
      draft.ingredients.map((ingredient) => ({
        recipe_id: recipeId,
        raw_text: ingredient.rawText,
        normalized_name: ingredient.normalizedName,
        amount_value: ingredient.amountValue,
        amount_unit: ingredient.amountUnit,
        importance: ingredient.importance,
      })),
    );

    if (error) {
      throw error;
    }
  }

  if (draft.steps.length > 0) {
    const { error } = await supabase.from("recipe_steps").insert(
      draft.steps.map((step) => ({
        recipe_id: recipeId,
        position: step.position,
        body: step.body,
      })),
    );

    if (error) {
      throw error;
    }
  }

  return recipeId;
}

export async function createReviewDraft(input: {
  draft: RecipeDraftInput;
  sourceUrl: string;
  sourceType: SourceType;
  sourceVideoId?: string;
  userId: string;
  parseConfidence?: number;
  parseWarnings?: string[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: input.userId,
      title: input.draft.title,
      source_url: input.sourceUrl,
      source_type: input.sourceType,
      source_video_id: input.sourceVideoId,
      thumbnail_url: "/recipe-jeyuk.svg",
      servings: input.draft.servings ?? "1인분",
      status: "needs_review",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("Review draft insert failed");
  }

  const recipeId = data.id as string;
  if (input.draft.ingredients.length > 0) {
    const { error: ingredientsError } = await supabase.from("ingredients").insert(
      input.draft.ingredients.map((ingredient) => ({
        recipe_id: recipeId,
        raw_text: ingredient.rawText,
        normalized_name: ingredient.normalizedName,
        amount_value: ingredient.amountValue,
        amount_unit: ingredient.amountUnit,
        importance: ingredient.importance,
      })),
    );

    if (ingredientsError) {
      throw ingredientsError;
    }
  }

  if (input.draft.steps.length > 0) {
    const { error: stepsError } = await supabase.from("recipe_steps").insert(
      input.draft.steps.map((step) => ({
        recipe_id: recipeId,
        position: step.position,
        body: step.body,
      })),
    );

    if (stepsError) {
      throw stepsError;
    }
  }

  if (input.parseWarnings !== undefined || input.parseConfidence !== undefined) {
    const { error: parsedSourceError } = await supabase.from("parsed_sources").insert({
      recipe_id: recipeId,
      parser_type:
        input.sourceType === "youtube" ? "youtube_description" : "webpage_llm",
      confidence: input.parseConfidence ?? null,
      warnings: input.parseWarnings ?? [],
    });

    if (parsedSourceError) {
      console.error("Failed to save parse warnings", parsedSourceError);
    }
  }

  return recipeId;
}

export async function updateRecipeFromDraft(recipeId: string, draft: RecipeDraftInput) {
  const supabase = await createClient();
  const { error: ingredientsDeleteError } = await supabase
    .from("ingredients")
    .delete()
    .eq("recipe_id", recipeId);

  if (ingredientsDeleteError) {
    throw ingredientsDeleteError;
  }

  const { error: stepsDeleteError } = await supabase
    .from("recipe_steps")
    .delete()
    .eq("recipe_id", recipeId);

  if (stepsDeleteError) {
    throw stepsDeleteError;
  }

  if (draft.ingredients.length > 0) {
    const { error } = await supabase.from("ingredients").insert(
      draft.ingredients.map((ingredient) => ({
        recipe_id: recipeId,
        raw_text: ingredient.rawText,
        normalized_name: ingredient.normalizedName,
        amount_value: ingredient.amountValue,
        amount_unit: ingredient.amountUnit,
        importance: ingredient.importance,
      })),
    );

    if (error) {
      throw error;
    }
  }

  if (draft.steps.length > 0) {
    const { error } = await supabase.from("recipe_steps").insert(
      draft.steps.map((step) => ({
        recipe_id: recipeId,
        position: step.position,
        body: step.body,
      })),
    );

    if (error) {
      throw error;
    }
  }

  const { error: recipeUpdateError } = await supabase
    .from("recipes")
    .update({
      title: draft.title,
      source_url: draft.sourceUrl,
      source_type: draft.sourceType,
      thumbnail_url: draft.thumbnailUrl ?? "/recipe-jeyuk.svg",
      servings: draft.servings ?? "1인분",
      status: "saved",
    })
    .eq("id", recipeId);

  if (recipeUpdateError) {
    throw recipeUpdateError;
  }
}

export function getFallbackRecipes(): RecipeListItem[] {
  return mockRecipes;
}
