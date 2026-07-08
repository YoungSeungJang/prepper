type Confidence = "high" | "medium" | "low";
export type IngredientImportance = "primary" | "secondary" | "seasoning";
type PriceBand = "cheap" | "normal" | "expensive" | "unknown";
type RecipeStatus = "importing" | "needs_review" | "saved" | "failed";
export type SourceType = "youtube" | "web";

export type RecipeStatusFilter = Extract<RecipeStatus, "needs_review" | "saved">;

export type RecipeSummary = {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: SourceType;
  thumbnailUrl: string;
  servings: string;
  status: RecipeStatusFilter;
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
  parseConfidence?: number;
  parseWarnings?: string[];
};

export type RecipeRow = {
  id: string;
  title: string;
  source_url: string;
  source_type: SourceType;
  thumbnail_url: string | null;
  servings: string | null;
  status: RecipeStatus;
  created_at: string;
  ingredients: Array<{
    raw_text: string;
    importance: IngredientImportance;
  }>;
  recipe_steps: Array<{
    position: number;
    body: string;
  }>;
  parsed_sources?: Array<{
    warnings: unknown;
  }>;
};

export type RecipeRepository = {
  createRecipe: (input: {
    draft: RecipeDraftInput;
    token: string;
    userId: string;
  }) => Promise<string>;
  createReviewDraft: (input: {
    draft: RecipeDraftInput;
    parseConfidence?: number;
    parseWarnings?: string[];
    sourceVideoId?: string;
    token: string;
    userId: string;
  }) => Promise<string>;
  findRecipeBySourceUrl: (input: {
    sourceUrl: string;
    token: string;
    userId: string;
  }) => Promise<{ id: string; status: RecipeStatusFilter } | null>;
  getRecipe: (input: {
    id: string;
    token: string;
    userId: string;
  }) => Promise<RecipeSummary | null>;
  listRecipes: (input: {
    status?: RecipeStatusFilter;
    token: string;
    userId: string;
  }) => Promise<RecipeSummary[]>;
};
