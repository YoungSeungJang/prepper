import { describe, expect, it } from "vitest";
import {
  buildImportQualityWarnings,
  extractReadableTextFromHtml,
  fetchYoutubeSourceText,
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
      "유튜브 설명/자막에서 레시피 정보를 충분히 찾지 못했어요. 재료와 조리 순서를 직접 확인해 주세요.",
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

  it("adds YouTube transcript text when the description is not enough", async () => {
    const originalFetch = globalThis.fetch;
    const originalApiKey = process.env.YOUTUBE_API_KEY;
    process.env.YOUTUBE_API_KEY = "youtube-key";

    globalThis.fetch = async (input) => {
      const url = input.toString();

      if (url.startsWith("https://www.googleapis.com/youtube/v3/videos")) {
        return Response.json({
          items: [
            {
              snippet: {
                title: "계란볶음밥",
                channelTitle: "요리채널",
                description: "맛있는 볶음밥 쇼츠",
              },
            },
          ],
        });
      }

      if (url.startsWith("https://www.youtube.com/watch")) {
        return new Response(`
          <script>
            var ytInitialPlayerResponse = {
              "captions": {
                "playerCaptionsTracklistRenderer": {
                  "captionTracks": [
                    { "baseUrl": "https://example.com/caption.xml", "languageCode": "ko" }
                  ]
                }
              }
            };
          </script>
        `);
      }

      if (url === "https://example.com/caption.xml") {
        return new Response(`
          <transcript>
            <text start="0">계란 두 개를 풀어주세요</text>
            <text start="2">밥을 넣고 간장으로 볶아주세요</text>
          </transcript>
        `);
      }

      throw new Error(`Unexpected fetch: ${url}`);
    };

    try {
      const text = await fetchYoutubeSourceText("https://www.youtube.com/shorts/abc123");

      expect(text).toContain("제목: 계란볶음밥");
      expect(text).toContain("자막:");
      expect(text).toContain("계란 두 개를 풀어주세요");
      expect(text).toContain("밥을 넣고 간장으로 볶아주세요");
    } finally {
      globalThis.fetch = originalFetch;
      process.env.YOUTUBE_API_KEY = originalApiKey;
    }
  });

  it("still checks YouTube transcript when the description only says recipe", async () => {
    const originalFetch = globalThis.fetch;
    const originalApiKey = process.env.YOUTUBE_API_KEY;
    process.env.YOUTUBE_API_KEY = "youtube-key";

    globalThis.fetch = async (input) => {
      const url = input.toString();

      if (url.startsWith("https://www.googleapis.com/youtube/v3/videos")) {
        return Response.json({
          items: [
            {
              snippet: {
                title: "오이무침",
                channelTitle: "요리채널",
                description: "초간단 오이무침 레시피",
              },
            },
          ],
        });
      }

      if (url.startsWith("https://www.youtube.com/watch")) {
        return new Response(`
          <script>
            var ytInitialPlayerResponse = {
              "captions": {
                "playerCaptionsTracklistRenderer": {
                  "captionTracks": [
                    { "baseUrl": "https://example.com/cucumber-caption.xml", "languageCode": "ko" }
                  ]
                }
              }
            };
          </script>
        `);
      }

      if (url === "https://example.com/cucumber-caption.xml") {
        return new Response(`
          <transcript>
            <text>오이는 얇게 썰고 고춧가루와 식초를 넣어 무쳐주세요</text>
          </transcript>
        `);
      }

      throw new Error(`Unexpected fetch: ${url}`);
    };

    try {
      const text = await fetchYoutubeSourceText("https://www.youtube.com/shorts/abc123");

      expect(text).toContain("자막:");
      expect(text).toContain("오이는 얇게 썰고 고춧가루와 식초를 넣어 무쳐주세요");
    } finally {
      globalThis.fetch = originalFetch;
      process.env.YOUTUBE_API_KEY = originalApiKey;
    }
  });
});
