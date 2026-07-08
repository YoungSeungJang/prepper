import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/auth.js";

export function getCurrentUser(request: Request, response: Response) {
  const authenticatedRequest = request as AuthenticatedRequest;
  response.json({ user: authenticatedRequest.auth.user });
}
