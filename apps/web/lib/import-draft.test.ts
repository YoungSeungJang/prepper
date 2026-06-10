import { describe, expect, it } from "vitest";
import { parseRecipeHtmlDraft } from "./import-draft";

describe("parseRecipeHtmlDraft", () => {
  it("extracts JSON-LD Recipe fields", () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "김치찌개",
              "recipeYield": "2인분",
              "recipeIngredient": ["김치 1컵", "두부 1모"],
              "recipeInstructions": [
                { "@type": "HowToStep", "text": "김치를 볶는다." },
                { "@type": "HowToStep", "text": "물을 붓고 끓인다." }
              ]
            }
          </script>
        </head>
      </html>
    `;

    expect(parseRecipeHtmlDraft(html, "https://example.com/recipe")).toEqual({
      title: "김치찌개",
      servings: "2인분",
      ingredients: ["김치 1컵", "두부 1모"],
      steps: ["김치를 볶는다.", "물을 붓고 끓인다."],
    });
  });

  it("falls back to the page title", () => {
    expect(
      parseRecipeHtmlDraft(
        "<html><head><title>간장 파스타 - Example</title></head></html>",
        "https://example.com/recipe",
      ),
    ).toMatchObject({
      title: "간장 파스타 - Example",
      ingredients: [],
      steps: [],
    });
  });
});
