export type MockIngredient = {
  rawText: string;
  importance: "primary" | "secondary" | "seasoning";
};

import type { RecipeListItem } from "./recipes/types";

export type MockRecipe = RecipeListItem;

type MockRecipeDefinition = {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: "youtube" | "web";
  thumbnailUrl: string;
  servings: string;
  status: "needs_review" | "saved";
  createdAt: string;
  reason: string;
  priceHint: {
    band: "cheap" | "normal" | "expensive" | "unknown";
    summary: string;
    confidence: "high" | "medium" | "low";
  };
  ingredients: MockIngredient[];
  steps: string[];
  warnings?: string[];
};

export const mockRecipes: MockRecipeDefinition[] = [
  {
    id: "jeyuk",
    title: "제육볶음",
    sourceUrl: "https://www.youtube.com/watch?v=example-jeyuk",
    sourceType: "youtube",
    thumbnailUrl: "/recipe-jeyuk.svg",
    servings: "1-2인분",
    status: "saved",
    createdAt: "2026-05-28",
    reason: "돼지고기 가격이 최근보다 낮은 편이에요",
    priceHint: {
      band: "cheap",
      summary: "주요 재료가 저렴한 편",
      confidence: "medium",
    },
    ingredients: [
      { rawText: "돼지고기 앞다리살 300g", importance: "primary" },
      { rawText: "양파 1/2개", importance: "secondary" },
      { rawText: "고추장 1큰술", importance: "seasoning" },
    ],
    steps: [
      "돼지고기와 양파를 먹기 좋은 크기로 썬다.",
      "양념을 섞어 고기에 버무린다.",
      "팬을 달군 뒤 고기와 양파를 볶는다.",
    ],
  },
  {
    id: "tofu-stew",
    title: "두부 김치찌개",
    sourceUrl: "https://example.com/tofu-stew",
    sourceType: "web",
    thumbnailUrl: "/recipe-stew.svg",
    servings: "2인분",
    status: "saved",
    createdAt: "2026-05-27",
    reason: "최근 저장한 레시피예요",
    priceHint: {
      band: "normal",
      summary: "보통 가격대",
      confidence: "low",
    },
    ingredients: [
      { rawText: "두부 1모", importance: "primary" },
      { rawText: "김치 1컵", importance: "primary" },
      { rawText: "대파 조금", importance: "secondary" },
    ],
    steps: [
      "냄비에 김치를 먼저 볶는다.",
      "물을 붓고 끓인 뒤 두부를 넣는다.",
      "간을 보고 대파를 올린다.",
    ],
  },
  {
    id: "soy-pasta",
    title: "간장 버터 파스타",
    sourceUrl: "https://example.com/soy-pasta",
    sourceType: "web",
    thumbnailUrl: "/recipe-pasta.svg",
    servings: "1인분",
    status: "needs_review",
    createdAt: "2026-05-26",
    reason: "가격 정보 없이 최근 저장순으로 보여드려요",
    priceHint: {
      band: "unknown",
      summary: "가격 정보 부족",
      confidence: "low",
    },
    ingredients: [
      { rawText: "스파게티면 100g", importance: "primary" },
      { rawText: "버터 10g", importance: "secondary" },
      { rawText: "간장 1큰술", importance: "seasoning" },
    ],
    steps: [
      "면을 삶는다.",
      "팬에 버터와 간장을 넣고 소스를 만든다.",
      "삶은 면을 넣고 빠르게 섞는다.",
    ],
    warnings: ["재료 양이 일부 불확실해요.", "조리 순서는 원문을 확인해 주세요."],
  },
];

export function getRecipeById(id: string) {
  return mockRecipes.find((recipe) => recipe.id === id);
}
