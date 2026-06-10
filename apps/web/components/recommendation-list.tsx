import type { RecipeListItem } from "@/lib/recipes/types";
import { RecipeCard } from "./recipe-card";

export function RecommendationList({ recipes }: { recipes: RecipeListItem[] }) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-600">
        레시피를 먼저 저장해보세요.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
