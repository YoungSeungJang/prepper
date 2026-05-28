import { describe, expect, it } from "vitest";
import { validateRecipeUrl } from "../src/recipes/validation";

describe("validateRecipeUrl", () => {
  it("rejects empty input", () => {
    expect(validateRecipeUrl("")).toEqual({
      ok: false,
      message: "링크를 입력해주세요",
    });
  });

  it("rejects invalid URLs", () => {
    expect(validateRecipeUrl("not a url")).toEqual({
      ok: false,
      message: "올바른 링크가 아니에요",
    });
  });

  it("rejects unsupported schemes", () => {
    expect(validateRecipeUrl("file:///etc/passwd")).toEqual({
      ok: false,
      message: "지원하지 않는 링크입니다",
    });
  });

  it("rejects localhost and private IP URLs", () => {
    expect(validateRecipeUrl("http://localhost:3000/recipe")).toEqual({
      ok: false,
      message: "지원하지 않는 링크입니다",
    });
    expect(validateRecipeUrl("http://192.168.0.10/recipe")).toEqual({
      ok: false,
      message: "지원하지 않는 링크입니다",
    });
  });

  it("detects YouTube watch URLs", () => {
    expect(validateRecipeUrl("https://www.youtube.com/watch?v=abc123")).toMatchObject({
      ok: true,
      sourceType: "youtube",
      youtubeVideoId: "abc123",
    });
  });

  it("detects YouTube short URLs", () => {
    expect(validateRecipeUrl("https://youtu.be/abc123")).toMatchObject({
      ok: true,
      sourceType: "youtube",
      youtubeVideoId: "abc123",
    });
  });

  it("accepts web recipe URLs", () => {
    expect(validateRecipeUrl("https://example.com/recipe")).toMatchObject({
      ok: true,
      sourceType: "web",
    });
  });
});
