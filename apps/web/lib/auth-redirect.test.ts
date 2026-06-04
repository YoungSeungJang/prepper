import { describe, expect, it } from "vitest";
import { getSafeNextPath } from "./auth-redirect";

describe("getSafeNextPath", () => {
  it("allows internal app paths", () => {
    expect(getSafeNextPath("/recipes/new")).toBe("/recipes/new");
  });

  it("falls back for external or missing paths", () => {
    expect(getSafeNextPath("https://example.com")).toBe("/recipes");
    expect(getSafeNextPath("//example.com")).toBe("/recipes");
    expect(getSafeNextPath(null)).toBe("/recipes");
  });
});
