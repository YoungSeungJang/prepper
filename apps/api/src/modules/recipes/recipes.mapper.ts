import type { RecipeRow, RecipeSummary } from "./recipes.types.js";

function parseWarnings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

export function toRecipeSummary(row: RecipeRow): RecipeSummary {
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
