import type { IngredientImportance, SourceType } from "@prepper/shared";

type ImportedDraft = {
  title: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
};

type ImportDraftInput = {
  sourceType: SourceType;
  sourceUrl: string;
};

const fallbackIngredients = ["재료를 확인해 주세요"];
const fallbackSteps = ["원문을 보고 조리 순서를 확인해 주세요."];

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function stripTagsPreservingBreaks(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function decodeBasicEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function splitLines(value: string) {
  return decodeBasicEntities(stripTagsPreservingBreaks(value))
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function findRecipeJsonLd(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecipeJsonLd(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  const type = record["@type"];

  if (
    type === "Recipe" ||
    (Array.isArray(type) && type.some((item) => item === "Recipe"))
  ) {
    return record;
  }

  return findRecipeJsonLd(record["@graph"]);
}

function getJsonLdBlocks(html: string) {
  return Array.from(
    html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
    (match) => match[1]?.trim() ?? "",
  ).filter(Boolean);
}

function parseIngredients(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean);
  }

  if (typeof value === "string") {
    return splitLines(value);
  }

  return [];
}

function parseInstruction(value: unknown): string[] {
  if (typeof value === "string") {
    return splitLines(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nested = parseInstructions(record.itemListElement);
    const text = stripTags(asText(record.text) || asText(record.name));
    return [...nested, ...(text ? [text] : [])];
  }

  return [];
}

function parseInstructions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(parseInstruction).filter(Boolean);
  }

  return parseInstruction(value).filter(Boolean);
}

function getPageTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? decodeBasicEntities(stripTags(title)) : "";
}

function extractSectionItems(html: string, headingPattern: RegExp) {
  const headingMatch = Array.from(
    html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi),
  ).find((match) => headingPattern.test(stripTags(match[1] ?? "")));

  if (!headingMatch || headingMatch.index === undefined) {
    return [];
  }

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const rest = html.slice(sectionStart);
  const nextHeadingIndex = rest.search(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i);
  const sectionHtml = nextHeadingIndex >= 0 ? rest.slice(0, nextHeadingIndex) : rest;
  const itemMatches = Array.from(
    sectionHtml.matchAll(/<(?:li|p)[^>]*>([\s\S]*?)<\/(?:li|p)>/gi),
    (match) => decodeBasicEntities(stripTags(match[1] ?? "")),
  ).filter(Boolean);

  return itemMatches.length > 0 ? itemMatches : splitLines(sectionHtml);
}

export function parseRecipeHtmlDraft(html: string, sourceUrl: string): ImportedDraft {
  const fallbackSectionIngredients = extractSectionItems(
    html,
    /재료|ingredients?/i,
  );
  const fallbackSectionSteps = extractSectionItems(
    html,
    /조리|순서|만드는\s*법|만들기|directions?|instructions?|steps?/i,
  );

  for (const block of getJsonLdBlocks(html)) {
    try {
      const recipe = findRecipeJsonLd(JSON.parse(block));

      if (!recipe) {
        continue;
      }

      const ingredients = parseIngredients(recipe.recipeIngredient);
      const instructions = parseInstructions(recipe.recipeInstructions);
      const yieldValue = Array.isArray(recipe.recipeYield)
        ? asText(recipe.recipeYield[0])
        : asText(recipe.recipeYield);

      return {
        title: asText(recipe.name) || getPageTitle(html) || sourceUrl,
        servings: yieldValue || undefined,
        ingredients: ingredients.length > 0 ? ingredients : fallbackSectionIngredients,
        steps: instructions.length > 0 ? instructions : fallbackSectionSteps,
      };
    } catch {
      continue;
    }
  }

  return {
    title: getPageTitle(html) || sourceUrl,
    ingredients: fallbackSectionIngredients,
    steps: fallbackSectionSteps,
  };
}

function getImportance(index: number): IngredientImportance {
  if (index === 0) {
    return "primary";
  }

  if (index === 1) {
    return "secondary";
  }

  return "seasoning";
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "PrepperBot/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }

  return response.text();
}

async function fetchYoutubeTitle(sourceUrl: string) {
  const oembedUrl = new URL("https://www.youtube.com/oembed");
  oembedUrl.searchParams.set("url", sourceUrl);
  oembedUrl.searchParams.set("format", "json");

  const response = await fetch(oembedUrl);

  if (!response.ok) {
    throw new Error(`YouTube oEmbed failed: ${response.status}`);
  }

  const body = (await response.json()) as { title?: string };
  return body.title?.trim();
}

export async function buildImportedRecipeDraft(input: ImportDraftInput) {
  let imported: ImportedDraft;

  try {
    if (input.sourceType === "youtube") {
      imported = {
        title: (await fetchYoutubeTitle(input.sourceUrl)) ?? "유튜브 레시피",
        ingredients: [],
        steps: [],
      };
    } else {
      imported = parseRecipeHtmlDraft(await fetchText(input.sourceUrl), input.sourceUrl);
    }
  } catch (error) {
    console.error("Failed to import recipe draft", error);
    imported = {
      title: input.sourceType === "youtube" ? "유튜브 레시피" : "웹 레시피",
      ingredients: [],
      steps: [],
    };
  }

  const ingredients = (imported.ingredients.length > 0
    ? imported.ingredients
    : fallbackIngredients
  ).map((rawText, index) => ({
    rawText,
    importance: getImportance(index),
  }));
  const steps = (imported.steps.length > 0 ? imported.steps : fallbackSteps).map(
    (body, index) => ({
      position: index + 1,
      body,
    }),
  );

  return {
    title: imported.title,
    sourceUrl: input.sourceUrl,
    sourceType: input.sourceType,
    servings: imported.servings,
    ingredients,
    steps,
  };
}
