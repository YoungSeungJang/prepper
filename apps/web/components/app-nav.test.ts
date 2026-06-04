import { describe, expect, it } from "vitest";
import { isNavItemActive } from "./app-nav";

describe("isNavItemActive", () => {
  it("keeps the saved recipes nav inactive on the new recipe page", () => {
    expect(isNavItemActive("/recipes", "/recipes/new")).toBe(false);
    expect(isNavItemActive("/recipes/new", "/recipes/new")).toBe(true);
  });

  it("keeps saved recipes active on recipe detail pages", () => {
    expect(isNavItemActive("/recipes", "/recipes/jeyuk")).toBe(true);
  });
});
