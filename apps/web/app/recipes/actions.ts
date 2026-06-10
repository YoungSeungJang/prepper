"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { buildRecipeImportRedirect } from "@/lib/recipe-import";

export async function startRecipeImportAction(formData: FormData) {
  await requireUser("/recipes/new");

  const sourceUrl = formData.get("sourceUrl");
  const rawUrl = typeof sourceUrl === "string" ? sourceUrl.trim() : "";
  const result = buildRecipeImportRedirect(rawUrl);

  redirect(result.destination);
}
