import { describe, expect, it } from "vitest";
import { buildAuthCallbackUrl, getSafeNextPath } from "./auth-redirect";

describe("getSafeNextPath", () => {
  it("allows internal app paths", () => {
    expect(getSafeNextPath("/recipes/new")).toBe("/recipes/new");
  });

  it("falls back for external or missing paths", () => {
    expect(getSafeNextPath("https://example.com")).toBe("/recipes");
    expect(getSafeNextPath("//example.com")).toBe("/recipes");
    expect(getSafeNextPath(null)).toBe("/recipes");
  });

  it("builds an internal auth callback URL with the next path", () => {
    expect(buildAuthCallbackUrl("http://localhost:3000", "/recipes/new")).toBe(
      "http://localhost:3000/auth/callback?next=%2Frecipes%2Fnew",
    );
  });
});
