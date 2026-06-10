import type { IngredientImportance, RecipeDraftInput, SourceType } from "@prepper/shared";

type DraftFormResult =
  | { ok: true; draft: RecipeDraftInput }
  | { ok: false; message: string };

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getImportance(index: number): IngredientImportance {
  if (index === 0) {
    return "primary";
  }

  if (index === 1) {
    return "secondary";
  }

  return "seasoning";
}

function getSourceType(value: string): SourceType {
  return value === "youtube" ? "youtube" : "web";
}

export function parseRecipeDraftForm(formData: FormData): DraftFormResult {
  const sourceUrl = getFormString(formData, "sourceUrl");
  const title = getFormString(formData, "title");

  if (!title || !sourceUrl) {
    return { ok: false, message: "제목과 원본 링크를 확인해 주세요." };
  }

  const ingredients = parseLines(getFormString(formData, "ingredients")).map(
    (rawText, index) => ({
      rawText,
      importance: getImportance(index),
    }),
  );
  const steps = parseLines(getFormString(formData, "steps")).map((body, index) => ({
    position: index + 1,
    body,
  }));

  return {
    ok: true,
    draft: {
      title,
      sourceUrl,
      sourceType: getSourceType(getFormString(formData, "sourceType")),
      servings: getFormString(formData, "servings") || undefined,
      ingredients,
      steps,
    },
  };
}
