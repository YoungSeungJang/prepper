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
};

function toListItem(row: RecipeRow): RecipeListItem {
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
  };
}

export async function listRecipes(): Promise<RecipeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id,title,source_url,source_type,source_video_id,thumbnail_url,servings,status,created_at,ingredients(raw_text,importance),recipe_steps(position,body)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list recipes", error);
    return [];
  }

  return ((data ?? []) as RecipeRow[]).map(toListItem);
}

export async function getRecipe(id: string): Promise<RecipeListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id,title,source_url,source_type,source_video_id,thumbnail_url,servings,status,created_at,ingredients(raw_text,importance),recipe_steps(position,body)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load recipe", error);
    return null;
  }

  return data ? toListItem(data as RecipeRow) : null;
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

export function getFallbackRecipes(): RecipeListItem[] {
  return mockRecipes;
}
