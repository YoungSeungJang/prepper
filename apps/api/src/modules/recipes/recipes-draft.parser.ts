import type { IngredientImportance, RecipeDraftInput, SourceType } from "./recipes.types.js";

type DraftJsonResult =
  | { ok: true; draft: RecipeDraftInput }
  | { ok: false; message: string };

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getImportance(value: unknown, index: number): IngredientImportance {
  if (value === "primary" || value === "secondary" || value === "seasoning") {
    return value;
  }

  if (index === 0) {
    return "primary";
  }

  if (index === 1) {
    return "secondary";
  }

  return "seasoning";
}

function getSourceType(value: unknown): SourceType {
  return value === "youtube" ? "youtube" : "web";
}

function parseIngredients(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((ingredient, index) => {
      if (typeof ingredient === "string") {
        return {
          importance: getImportance(undefined, index),
          rawText: ingredient.trim(),
        };
      }

      if (typeof ingredient !== "object" || ingredient === null) {
        return null;
      }

      const record = ingredient as Record<string, unknown>;
      return {
        importance: getImportance(record.importance, index),
        rawText: getString(record.rawText),
      };
    })
    .filter((ingredient): ingredient is { rawText: string; importance: IngredientImportance } =>
      Boolean(ingredient?.rawText),
    );
}

function parseSteps(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((step, index) => {
      const body = typeof step === "string"
        ? step.trim()
        : typeof step === "object" && step !== null
          ? getString((step as Record<string, unknown>).body)
          : "";

      return {
        body,
        position: index + 1,
      };
    })
    .filter((step) => Boolean(step.body));
}

export function parseRecipeDraftJson(body: unknown): DraftJsonResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "레시피 정보를 확인해 주세요." };
  }

  const record = body as Record<string, unknown>;
  const sourceUrl = getString(record.sourceUrl);
  const title = getString(record.title) || getString(record.fallbackTitle);

  if (!title || !sourceUrl) {
    return { ok: false, message: "제목과 원본 링크를 확인해 주세요." };
  }

  const ingredients = parseIngredients(record.ingredients);
  if (ingredients.length === 0) {
    return { ok: false, message: "재료를 최소 1개 입력해 주세요." };
  }

  const steps = parseSteps(record.steps);
  if (steps.length === 0) {
    return { ok: false, message: "조리순서를 최소 1개 입력해 주세요." };
  }

  return {
    ok: true,
    draft: {
      ingredients,
      servings: getString(record.servings) || undefined,
      thumbnailUrl: getString(record.thumbnailUrl) || undefined,
      sourceType: getSourceType(record.sourceType),
      sourceUrl,
      steps,
      title,
    },
  };
}
