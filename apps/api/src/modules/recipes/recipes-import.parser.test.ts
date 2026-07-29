import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildImportedRecipeDraft,
  parseRecipeHtmlDraft,
} from "./recipes-import.parser.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("recipes import parser", () => {
  it("extracts thumbnail URLs from recipe JSON-LD", () => {
    const draft = parseRecipeHtmlDraft(
      `
        <html>
          <head>
            <title>김치찌개</title>
            <script type="application/ld+json">
              {
                "@type": "Recipe",
                "name": "김치찌개",
                "image": { "url": "/images/kimchi.jpg" },
                "recipeIngredient": ["김치 1컵", "두부 1모"],
                "recipeInstructions": ["김치를 볶는다.", "물을 넣고 끓인다."]
              }
            </script>
          </head>
        </html>
      `,
      "https://example.com/recipes/kimchi",
    );

    expect(draft.thumbnailUrl).toBe("https://example.com/images/kimchi.jpg");
  });

  it("extracts thumbnail URLs from Open Graph metadata", () => {
    const draft = parseRecipeHtmlDraft(
      `
        <html>
          <head>
            <title>된장찌개</title>
            <meta property="og:image" content="https://cdn.example.com/doenjang.jpg" />
          </head>
          <body>
            <h2>재료</h2>
            <ul><li>된장 1스푼</li></ul>
            <h2>조리순서</h2>
            <ol><li>끓인다.</li></ol>
          </body>
        </html>
      `,
      "https://example.com/recipes/doenjang",
    );

    expect(draft.thumbnailUrl).toBe("https://cdn.example.com/doenjang.jpg");
  });

  it("adds a YouTube thumbnail URL to imported drafts", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      const requestUrl = String(url);

      if (requestUrl.startsWith("https://www.youtube.com/oembed")) {
        return Response.json({ title: "제육볶음" });
      }

      return new Response("<html></html>");
    });
    vi.stubGlobal("fetch", fetchMock);

    const draft = await buildImportedRecipeDraft({
      sourceType: "youtube",
      sourceUrl: "https://www.youtube.com/watch?v=abc123",
    });

    expect(draft.thumbnailUrl).toBe("https://img.youtube.com/vi/abc123/hqdefault.jpg");
  });
});
