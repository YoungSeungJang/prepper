import type { PriceBand } from "../recipes/types";

const priceScores: Record<PriceBand, number> = {
  cheap: 30,
  normal: 15,
  expensive: -10,
  unknown: 0,
};

export function scoreRecommendation(input: {
  priceBand: PriceBand;
  daysSinceSaved: number;
}) {
  const recencyScore = Math.max(0, 20 - input.daysSinceSaved);
  return priceScores[input.priceBand] + recencyScore;
}
