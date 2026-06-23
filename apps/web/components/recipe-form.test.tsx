import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RecipeForm } from "./recipe-form";

describe("RecipeForm", () => {
  it("renders review ingredients and steps as item editors", () => {
    const html = renderToStaticMarkup(
      <RecipeForm
        ingredients={[{ rawText: "두부 1모" }]}
        mode="review"
        steps={["두부를 썬다."]}
      />,
    );

    expect(html).not.toContain("<textarea");
    expect(html).toContain("value=\"두부 1모\"");
    expect(html).toContain("value=\"두부를 썬다.\"");
    expect(html).toContain("placeholder=\"재료 추가\"");
    expect(html).toContain("placeholder=\"순서 추가\"");
  });
});
