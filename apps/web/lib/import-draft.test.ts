import { describe, expect, it } from "vitest";
import {
  buildImportQualityWarnings,
  extractReadableTextFromHtml,
  parseRecipeHtmlDraft,
} from "./import-draft";

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
    const draft = parseRecipeHtmlDraft(
      "<html><head><title>간장 파스타 - Example</title></head></html>",
      "https://example.com/recipe",
    );

    expect(draft).toMatchObject({
      title: "간장 파스타 - Example",
      ingredients: [],
      steps: [],
    });
    expect(buildImportQualityWarnings(draft, "web")).toEqual([
      "재료를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요.",
      "조리 순서를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요.",
    ]);
  });

  it("extracts instructions from HowToSection item lists", () => {
    const html = `
      <script type="application/ld+json">
        {
          "@type": "Recipe",
          "name": "된장찌개",
          "recipeIngredient": "된장 1큰술\\n두부 1모",
          "recipeInstructions": [
            {
              "@type": "HowToSection",
              "itemListElement": [
                { "@type": "HowToStep", "text": "냄비에 물을 끓인다." },
                { "@type": "HowToStep", "text": "된장과 두부를 넣는다." }
              ]
            }
          ]
        }
      </script>
    `;

    expect(parseRecipeHtmlDraft(html, "https://example.com/recipe")).toMatchObject({
      title: "된장찌개",
      ingredients: ["된장 1큰술", "두부 1모"],
      steps: ["냄비에 물을 끓인다.", "된장과 두부를 넣는다."],
    });
  });

  it("uses Korean section fallback when structured data is missing", () => {
    const html = `
      <html>
        <head><title>감자조림</title></head>
        <body>
          <h2>재료</h2>
          <p>감자 2개</p>
          <p>간장 2큰술</p>
          <h2>조리순서</h2>
          <p>감자를 썬다.</p>
          <p>양념과 함께 조린다.</p>
        </body>
      </html>
    `;

    expect(parseRecipeHtmlDraft(html, "https://example.com/recipe")).toMatchObject({
      title: "감자조림",
      ingredients: ["감자 2개", "간장 2큰술"],
      steps: ["감자를 썬다.", "양념과 함께 조린다."],
    });
  });

  it("warns when YouTube import only has metadata", () => {
    expect(
      buildImportQualityWarnings(
        {
          ingredients: [],
          steps: [],
        },
        "youtube",
      ),
    ).toEqual([
      "유튜브는 현재 제목만 가져왔어요. 재료와 조리 순서를 직접 확인해 주세요.",
      "재료를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요.",
      "조리 순서를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요.",
    ]);
  });

  it("extracts readable web text for LLM parsing", () => {
    const text = extractReadableTextFromHtml(
      `
        <html>
          <head>
            <title>닭볶음탕</title>
            <meta name="description" content="매콤한 닭볶음탕 레시피">
          </head>
          <body>
            <script>window.ad = true;</script>
            <main>
              <h1>닭볶음탕</h1>
              <p>닭 1마리</p>
              <p>감자와 양념을 넣고 끓인다.</p>
            </main>
          </body>
        </html>
      `,
      "https://example.com/recipe",
    );

    expect(text).toContain("제목: 닭볶음탕");
    expect(text).toContain("설명: 매콤한 닭볶음탕 레시피");
    expect(text).toContain("닭 1마리");
    expect(text).not.toContain("window.ad");
  });
});
