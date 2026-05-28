import { describe, expect, it } from "vitest";
import { scoreRecommendation } from "../src/recommendations/scoring";

describe("scoreRecommendation", () => {
  it("prefers cheap price signals over expensive ones", () => {
    expect(
      scoreRecommendation({ priceBand: "cheap", daysSinceSaved: 2 }),
    ).toBeGreaterThan(
      scoreRecommendation({ priceBand: "expensive", daysSinceSaved: 2 }),
    );
  });

  it("uses recency as fallback when price is unknown", () => {
    expect(
      scoreRecommendation({ priceBand: "unknown", daysSinceSaved: 1 }),
    ).toBeGreaterThan(
      scoreRecommendation({ priceBand: "unknown", daysSinceSaved: 30 }),
    );
  });
});
