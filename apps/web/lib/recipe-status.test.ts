import { describe, expect, it } from "vitest";
import { getRecipeHref } from "./recipe-status";

describe("getRecipeHref", () => {
  it("sends saved recipes to detail pages", () => {
    expect(getRecipeHref({ id: "recipe-1", status: "saved" })).toBe("/recipes/recipe-1");
  });

  it("sends review drafts back to review pages", () => {
    expect(getRecipeHref({ id: "recipe-1", status: "needs_review" })).toBe(
      "/recipes/recipe-1/review",
    );
  });
});
