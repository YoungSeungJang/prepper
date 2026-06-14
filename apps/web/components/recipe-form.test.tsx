import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RecipeForm } from "./recipe-form";

describe("RecipeForm", () => {
  it("does not submit sample recipe text when review data is empty", () => {
    const html = renderToStaticMarkup(<RecipeForm mode="review" />);

    expect(html).not.toContain(">돼지고기 앞다리살 300g");
    expect(html).not.toContain(">재료를 먹기 좋은 크기로 썬다.");
    expect(html).toContain("placeholder=\"돼지고기 앞다리살 300g");
  });
});
