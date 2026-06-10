"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseRecipeDraftForm } from "@/lib/recipe-draft";
import { buildRecipeImportRedirect } from "@/lib/recipe-import";
import { createRecipe } from "@/lib/recipes/queries";

export async function startRecipeImportAction(formData: FormData) {
  await requireUser("/recipes/new");

  const sourceUrl = formData.get("sourceUrl");
  const rawUrl = typeof sourceUrl === "string" ? sourceUrl.trim() : "";
  const result = buildRecipeImportRedirect(rawUrl);

  redirect(result.destination);
}

export async function saveRecipeAction(formData: FormData) {
  const user = await requireUser("/recipes/new");
  const draftResult = parseRecipeDraftForm(formData);
  const sourceUrl = formData.get("sourceUrl");
  const sourceType = formData.get("sourceType");
  const reviewUrl = new URLSearchParams({
    sourceUrl: typeof sourceUrl === "string" ? sourceUrl : "",
    sourceType: typeof sourceType === "string" ? sourceType : "web",
  });

  if (!draftResult.ok) {
    reviewUrl.set("error", draftResult.message);
    redirect(`/recipes/jeyuk/review?${reviewUrl.toString()}`);
  }

  let recipeId: string;
  try {
    recipeId = await createRecipe(draftResult.draft, user.id);
  } catch (error) {
    console.error("Failed to save recipe", error);
    reviewUrl.set("error", "레시피를 저장할 수 없습니다. Supabase migration 적용 여부를 확인해 주세요.");
    redirect(`/recipes/jeyuk/review?${reviewUrl.toString()}`);
  }

  redirect(`/recipes/${recipeId}`);
}
