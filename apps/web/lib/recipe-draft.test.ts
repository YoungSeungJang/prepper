import { describe, expect, it } from "vitest";
import { parseRecipeDraftForm } from "./recipe-draft";

describe("parseRecipeDraftForm", () => {
  it("normalizes multiline ingredients and steps", () => {
    const formData = new FormData();
    formData.set("sourceUrl", "https://example.com/recipe");
    formData.set("sourceType", "web");
    formData.set("title", " 김치찌개 ");
    formData.set("servings", "2인분");
    formData.set("ingredients", "두부 1모\n\n김치 1컵");
    formData.set("steps", "김치를 볶는다.\n물을 붓는다.");

    expect(parseRecipeDraftForm(formData)).toEqual({
      ok: true,
      draft: {
        sourceUrl: "https://example.com/recipe",
        sourceType: "web",
        title: "김치찌개",
        servings: "2인분",
        ingredients: [
          { rawText: "두부 1모", importance: "primary" },
          { rawText: "김치 1컵", importance: "secondary" },
        ],
        steps: [
          { position: 1, body: "김치를 볶는다." },
          { position: 2, body: "물을 붓는다." },
        ],
      },
    });
  });

  it("rejects missing required fields", () => {
    expect(parseRecipeDraftForm(new FormData())).toEqual({
      ok: false,
      message: "제목과 원본 링크를 확인해 주세요.",
    });
  });
});
