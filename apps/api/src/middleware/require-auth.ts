import type { NextFunction, Request, Response } from "express";
import type { AuthClient, AuthenticatedRequest } from "../types/auth.js";

function getBearerToken(request: Request) {
  const header = request.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export function createRequireAuth(auth: AuthClient) {
  return async (request: Request, response: Response, next: NextFunction) => {
    const token = getBearerToken(request);
    if (!token) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { data, error } = await auth.getUser(token);
    if (error || !data.user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    (request as AuthenticatedRequest).auth = {
      token,
      user: data.user,
    };
    next();
  };
}
