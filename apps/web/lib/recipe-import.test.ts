import { describe, expect, it } from "vitest";
import { validateRecipeImportUrl } from "./recipe-import";

describe("validateRecipeImportUrl", () => {
  it("returns a new-page error redirect for invalid URLs", () => {
    expect(validateRecipeImportUrl("not a url")).toEqual({
      ok: false,
      destination:
        "/?addRecipe=1&error=%EC%98%AC%EB%B0%94%EB%A5%B8+%EB%A7%81%ED%81%AC%EA%B0%80+%EC%95%84%EB%8B%88%EC%97%90%EC%9A%94&sourceUrl=not+a+url",
    });
  });

  it("returns normalized URL metadata for valid URLs", () => {
    expect(validateRecipeImportUrl("https://www.youtube.com/watch?v=abc123")).toEqual({
      ok: true,
      sourceUrl: "https://www.youtube.com/watch?v=abc123",
      sourceType: "youtube",
      youtubeVideoId: "abc123",
    });
  });
});
