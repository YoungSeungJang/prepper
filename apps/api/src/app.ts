import express from "express";
import { createRequireAuth } from "./middleware/require-auth.js";
import { createHealthRouter } from "./modules/health/health.routes.js";
import type { ImportedRecipeDraft } from "./modules/recipes/recipes-import.parser.js";
import { createRecipesRouter } from "./modules/recipes/recipes.routes.js";
import type { RecipeRepository } from "./modules/recipes/recipes.types.js";
import { createUsersRouter } from "./modules/users/users.routes.js";
import type { AuthClient } from "./types/auth.js";

type AppDependencies = {
  auth: AuthClient;
  draftBuilder?: (input: {
    sourceType: "youtube" | "web";
    sourceUrl: string;
  }) => Promise<ImportedRecipeDraft>;
  recipes: RecipeRepository;
};

export function createApp({ auth, draftBuilder, recipes }: AppDependencies) {
  const app = express();
  const requireAuth = createRequireAuth(auth);

  app.use(express.json());
  app.use(createHealthRouter());
  app.use(createUsersRouter({ requireAuth }));
  app.use("/recipes", createRecipesRouter({ draftBuilder, recipes, requireAuth }));

  return app;
}
