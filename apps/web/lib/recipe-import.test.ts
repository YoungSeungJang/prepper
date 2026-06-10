import { describe, expect, it } from "vitest";
import { buildRecipeImportRedirect } from "./recipe-import";

describe("buildRecipeImportRedirect", () => {
  it("returns a new-page error redirect for invalid URLs", () => {
    expect(buildRecipeImportRedirect("not a url")).toEqual({
      ok: false,
      destination:
        "/recipes/new?error=%EC%98%AC%EB%B0%94%EB%A5%B8+%EB%A7%81%ED%81%AC%EA%B0%80+%EC%95%84%EB%8B%88%EC%97%90%EC%9A%94&sourceUrl=not+a+url",
    });
  });

  it("returns a mock review redirect for valid URLs", () => {
    expect(buildRecipeImportRedirect("https://www.youtube.com/watch?v=abc123")).toEqual({
      ok: true,
      destination:
        "/recipes/jeyuk/review?sourceUrl=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dabc123&sourceType=youtube&youtubeVideoId=abc123",
    });
  });
});
