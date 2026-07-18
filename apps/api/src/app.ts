import express, { type ErrorRequestHandler } from "express";
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
  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    console.error("Unhandled API error", error);
    response.status(500).json({
      error: "요청을 처리하지 못했습니다. 서버 로그를 확인해 주세요.",
    });
  };

  app.use(express.json());
  app.use(createHealthRouter());
  app.use(createUsersRouter({ requireAuth }));
  app.use("/recipes", createRecipesRouter({ draftBuilder, recipes, requireAuth }));
  app.use(errorHandler);

  return app;
}
