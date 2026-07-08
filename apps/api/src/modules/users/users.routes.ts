import { Router, type RequestHandler } from "express";
import { getCurrentUser } from "./users.controller.js";

type UsersRouterDependencies = {
  requireAuth: RequestHandler;
};

export function createUsersRouter({ requireAuth }: UsersRouterDependencies) {
  const router = Router();

  router.get("/me", requireAuth, getCurrentUser);

  return router;
}
