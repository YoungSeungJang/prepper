import { describe, expect, it } from "vitest";
import { isNavItemActive } from "./app-nav";

describe("isNavItemActive", () => {
  it("keeps home active only on the app home route", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/", "/recipes/recipe-1/review")).toBe(false);
  });
});
