import type { Request } from "express";

export type SupabaseUser = {
  id: string;
  email?: string;
};

export type AuthClient = {
  getUser: (token: string) => Promise<{
    data: {
      user: SupabaseUser | null;
    };
    error: unknown;
  }>;
};

export type AuthenticatedRequest = Request & {
  auth: {
    token: string;
    user: SupabaseUser;
  };
};
