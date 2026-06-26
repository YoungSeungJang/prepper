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

function parseFormLines(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .flatMap((value) => (typeof value === "string" ? parseLines(value) : []));
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
  const title = getFormString(formData, "title") || getFormString(formData, "fallbackTitle");

  if (!title || !sourceUrl) {
    return { ok: false, message: "제목과 원본 링크를 확인해 주세요." };
  }

  const ingredients = parseFormLines(formData, "ingredients").map((rawText, index) => ({
    rawText,
    importance: getImportance(index),
  }));
  const steps = parseFormLines(formData, "steps").map((body, index) => ({
    position: index + 1,
    body,
  }));

  if (ingredients.length === 0) {
    return { ok: false, message: "재료를 최소 1개 입력해 주세요." };
  }

  if (steps.length === 0) {
    return { ok: false, message: "조리순서를 최소 1개 입력해 주세요." };
  }

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
