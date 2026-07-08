import { createApiSupabaseClient } from "../../lib/supabase.js";
import { toRecipeSummary } from "./recipes.mapper.js";
import type { RecipeRepository, RecipeRow } from "./recipes.types.js";

const recipeSelect =
  "id,title,source_url,source_type,thumbnail_url,servings,status,created_at,ingredients(raw_text,importance),recipe_steps(position,body),parsed_sources(warnings)";

export function createSupabaseRecipeRepository(input: {
  supabaseAnonKey: string;
  supabaseUrl: string;
}): RecipeRepository {
  function createRequestClient(token: string) {
    return createApiSupabaseClient({
      anonKey: input.supabaseAnonKey,
      token,
      url: input.supabaseUrl,
    });
  }

  return {
    async createRecipe({ draft, token, userId }) {
      const supabase = createRequestClient(token);
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
    },

    async createReviewDraft({
      draft,
      parseConfidence,
      parseWarnings,
      sourceVideoId,
      token,
      userId,
    }) {
      const supabase = createRequestClient(token);
      const { data, error } = await supabase
        .from("recipes")
        .insert({
          user_id: userId,
          title: draft.title,
          source_url: draft.sourceUrl,
          source_type: draft.sourceType,
          source_video_id: sourceVideoId,
          thumbnail_url: draft.thumbnailUrl ?? "/recipe-jeyuk.svg",
          servings: draft.servings ?? "1인분",
          status: "needs_review",
        })
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Review draft insert failed");
      }

      const recipeId = data.id as string;

      if (draft.ingredients.length > 0) {
        const { error: ingredientsError } = await supabase.from("ingredients").insert(
          draft.ingredients.map((ingredient) => ({
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

      if (draft.steps.length > 0) {
        const { error: stepsError } = await supabase.from("recipe_steps").insert(
          draft.steps.map((step) => ({
            recipe_id: recipeId,
            position: step.position,
            body: step.body,
          })),
        );

        if (stepsError) {
          throw stepsError;
        }
      }

      if (parseWarnings !== undefined || parseConfidence !== undefined) {
        const { error: parsedSourceError } = await supabase.from("parsed_sources").insert({
          recipe_id: recipeId,
          parser_type: draft.sourceType === "youtube" ? "youtube_description" : "webpage_llm",
          confidence: parseConfidence ?? null,
          warnings: parseWarnings ?? [],
        });

        if (parsedSourceError) {
          console.error("Failed to save parse warnings", parsedSourceError);
        }
      }

      return recipeId;
    },

    async findRecipeBySourceUrl({ sourceUrl, token, userId }) {
      const supabase = createRequestClient(token);
      const { data, error } = await supabase
        .from("recipes")
        .select("id,status")
        .eq("user_id", userId)
        .eq("source_url", sourceUrl)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as { id: string; status: "saved" | "needs_review" } | null;
    },

    async listRecipes({ status, token, userId }) {
      const supabase = createRequestClient(token);
      let query = supabase
        .from("recipes")
        .select(recipeSelect)
        .eq("user_id", userId);

      query = status ? query.eq("status", status) : query.in("status", ["saved", "needs_review"]);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return ((data ?? []) as RecipeRow[]).map(toRecipeSummary);
    },

    async getRecipe({ id, token, userId }) {
      const supabase = createRequestClient(token);
      const { data, error } = await supabase
        .from("recipes")
        .select(recipeSelect)
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? toRecipeSummary(data as RecipeRow) : null;
    },
  };
}
