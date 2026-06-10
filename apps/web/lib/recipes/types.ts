import type { Confidence, IngredientImportance, PriceBand, RecipeStatus, SourceType } from "@prepper/shared";

export type RecipeListItem = {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: SourceType;
  thumbnailUrl: string;
  servings: string;
  status: Extract<RecipeStatus, "needs_review" | "saved">;
  createdAt: string;
  reason: string;
  priceHint: {
    band: PriceBand;
    summary: string;
    confidence: Confidence;
  };
  ingredients: Array<{
    rawText: string;
    importance: IngredientImportance;
  }>;
  steps: string[];
  warnings?: string[];
};
