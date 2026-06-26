"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  buildImportedRecipeDraft,
  shouldAutoSaveImportedRecipeDraft,
} from "@/lib/import-draft";
import { parseRecipeDraftForm } from "@/lib/recipe-draft";
import { validateRecipeImportUrl } from "@/lib/recipe-import";
import {
  createRecipe,
  createReviewDraft,
  updateRecipeFromDraft,
} from "@/lib/recipes/queries";

export type RecipeImportFormState = {
  error?: string;
  sourceUrl?: string;
};

async function importRecipeFromForm(formData: FormData): Promise<RecipeImportFormState> {
  const nextPathValue = formData.get("nextPath");
  const nextPath = typeof nextPathValue === "string" ? nextPathValue : "/";
  const user = await requireUser(nextPath);

  const sourceUrl = formData.get("sourceUrl");
  const rawUrl = typeof sourceUrl === "string" ? sourceUrl.trim() : "";
  const result = validateRecipeImportUrl(rawUrl);

  if (!result.ok) {
    return {
      error: result.message,
      sourceUrl: rawUrl,
    };
  }

  let destination = "/";
  try {
    const draft = await buildImportedRecipeDraft({
      sourceUrl: result.sourceUrl,
      sourceType: result.sourceType,
    });

    if (shouldAutoSaveImportedRecipeDraft(draft)) {
      const recipeId = await createRecipe(draft, user.id);
      destination = `/?recipe=${recipeId}`;
    } else {
      const recipeId = await createReviewDraft({
        draft,
        sourceUrl: result.sourceUrl,
        sourceType: result.sourceType,
        sourceVideoId: result.youtubeVideoId,
        userId: user.id,
        parseConfidence: draft.parseConfidence,
        parseWarnings: draft.parseWarnings,
      });
      destination = `/?review=${recipeId}`;
    }
  } catch (error) {
    console.error("Failed to create review draft", error);
    return {
      error: "검토 초안을 만들 수 없습니다. Supabase migration 적용 여부를 확인해 주세요.",
      sourceUrl: rawUrl,
    };
  }

  redirect(destination);
}

export async function startRecipeImportFromModalAction(
  _previousState: RecipeImportFormState,
  formData: FormData,
): Promise<RecipeImportFormState> {
  return importRecipeFromForm(formData);
}

export async function saveRecipeAction(formData: FormData) {
  await requireUser("/");
  const draftResult = parseRecipeDraftForm(formData);
  const recipeIdValue = formData.get("recipeId");
  const recipeId = typeof recipeIdValue === "string" ? recipeIdValue : "";
  const sourceUrl = formData.get("sourceUrl");
  const sourceType = formData.get("sourceType");
  const reviewUrl = new URLSearchParams({
    sourceUrl: typeof sourceUrl === "string" ? sourceUrl : "",
    sourceType: typeof sourceType === "string" ? sourceType : "web",
  });

  if (!draftResult.ok) {
    reviewUrl.set("error", draftResult.message);
    redirect(`/?review=${recipeId || "jeyuk"}&${reviewUrl.toString()}`);
  }

  if (!recipeId) {
    reviewUrl.set("error", "저장할 레시피 초안을 찾을 수 없습니다.");
    redirect(`/?review=jeyuk&${reviewUrl.toString()}`);
  }

  try {
    await updateRecipeFromDraft(recipeId, draftResult.draft);
  } catch (error) {
    console.error("Failed to save recipe", error);
    reviewUrl.set("error", "레시피를 저장할 수 없습니다. Supabase migration 적용 여부를 확인해 주세요.");
    redirect(`/?review=${recipeId || "jeyuk"}&${reviewUrl.toString()}`);
  }

  redirect(`/?recipe=${recipeId}`);
}
