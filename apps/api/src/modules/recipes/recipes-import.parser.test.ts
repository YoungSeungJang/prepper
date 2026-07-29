import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildImportedRecipeDraft,
  fetchYoutubeSourceText,
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

  it("does not add YouTube transcript text when the description has no steps", async () => {
    const originalApiKey = process.env.YOUTUBE_API_KEY;
    process.env.YOUTUBE_API_KEY = "youtube-key";

    const fetchMock = vi.fn(async (url: string | URL) => {
      const requestUrl = String(url);

      if (requestUrl.startsWith("https://www.googleapis.com/youtube/v3/videos")) {
        return Response.json({
          items: [
            {
              snippet: {
                channelTitle: "요리채널",
                description: "맛있는 볶음밥 쇼츠",
                title: "계란볶음밥",
              },
            },
          ],
        });
      }

      if (requestUrl.startsWith("https://www.youtube.com/watch")) {
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

      if (requestUrl === "https://example.com/caption.xml") {
        return new Response(`
          <transcript>
            <text>계란 두 개를 풀어주세요</text>
            <text>밥을 넣고 간장으로 볶아주세요</text>
          </transcript>
        `);
      }

      throw new Error(`Unexpected fetch: ${requestUrl}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const text = await fetchYoutubeSourceText("https://www.youtube.com/shorts/abc123");

      expect(text).toContain("제목: 계란볶음밥");
      expect(text).not.toContain("자막:");
      expect(text).not.toContain("계란 두 개를 풀어주세요");
      expect(fetchMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ hostname: "www.youtube.com" }),
      );
    } finally {
      process.env.YOUTUBE_API_KEY = originalApiKey;
    }
  });
});
