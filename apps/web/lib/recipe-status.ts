import type { RecipeListItem } from "./recipes/types";

export function getRecipeHref(recipe: Pick<RecipeListItem, "id" | "status">) {
  return recipe.status === "needs_review"
    ? `/?review=${recipe.id}`
    : `/?recipe=${recipe.id}`;
}
