/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecipeSearchControl } from "./recipe-search-control";

const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigationMocks.replace }),
  useSearchParams: () => navigationMocks.searchParams,
}));

describe("RecipeSearchControl", () => {
  it("syncs a new initial query without replacing the focused input", () => {
    const { rerender } = render(
      <RecipeSearchControl activeCategory="saved" initialQuery="" />,
    );
    const input = screen.getByLabelText("레시피나 재료 검색");

    input.focus();
    rerender(
      <RecipeSearchControl activeCategory="saved" initialQuery="김치" />,
    );

    expect((input as HTMLInputElement).value).toBe("김치");
    expect(document.activeElement).toBe(input);
  });
});
