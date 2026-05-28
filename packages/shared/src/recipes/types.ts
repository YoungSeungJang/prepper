export type RecipeStatus = "importing" | "needs_review" | "saved" | "failed";

export type SourceType = "youtube" | "web";

export type IngredientImportance = "primary" | "secondary" | "seasoning";

export type PriceBand = "cheap" | "normal" | "expensive" | "unknown";

export type Confidence = "high" | "medium" | "low";

export type RecipeDraftInput = {
  title: string;
  sourceUrl: string;
  sourceType: SourceType;
  thumbnailUrl?: string;
  servings?: string;
  ingredients: Array<{
    rawText: string;
    normalizedName?: string;
    amountValue?: number;
    amountUnit?: string;
    importance: IngredientImportance;
  }>;
  steps: Array<{
    position: number;
    body: string;
  }>;
};
