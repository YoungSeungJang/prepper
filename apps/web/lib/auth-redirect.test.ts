import { describe, expect, it } from "vitest";
import { buildAuthCallbackUrl, getSafeNextPath } from "./auth-redirect";

describe("getSafeNextPath", () => {
  it("allows internal app paths", () => {
    expect(getSafeNextPath("/?recipe=recipe-1")).toBe("/?recipe=recipe-1");
  });

  it("falls back for external or missing paths", () => {
    expect(getSafeNextPath("https://example.com")).toBe("/");
    expect(getSafeNextPath("//example.com")).toBe("/");
    expect(getSafeNextPath(null)).toBe("/");
  });

  it("builds an internal auth callback URL with the next path", () => {
    expect(buildAuthCallbackUrl("http://localhost:3000", "/?recipe=recipe-1")).toBe(
      "http://localhost:3000/auth/callback?next=%2F%3Frecipe%3Drecipe-1",
    );
  });
});
