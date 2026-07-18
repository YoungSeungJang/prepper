import { Router, type RequestHandler } from "express";
import type { ImportedRecipeDraft } from "./recipes-import.parser.js";
import { createRecipesController } from "./recipes.controller.js";
import type { RecipeRepository } from "./recipes.types.js";

type RecipesRouterDependencies = {
  draftBuilder?: (input: {
    sourceType: "youtube" | "web";
    sourceUrl: string;
  }) => Promise<ImportedRecipeDraft>;
  recipes: RecipeRepository;
  requireAuth: RequestHandler;
};

export function createRecipesRouter({
  draftBuilder,
  recipes,
  requireAuth,
}: RecipesRouterDependencies) {
  const router = Router();
  const controller = createRecipesController({ draftBuilder, recipes });

  router.use(requireAuth);
  router.post("/import", controller.startRecipeImport);
  router.get("/", controller.listRecipes);
  router.get("/:id", controller.getRecipe);
  router.patch("/:id", controller.updateRecipe);
  router.delete("/:id", controller.deleteRecipe);

  return router;
}
