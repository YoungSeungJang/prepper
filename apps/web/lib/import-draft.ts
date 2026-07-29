import type { IngredientImportance, SourceType } from "@prepper/shared";

type ImportedDraft = {
  title: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
  warnings?: string[];
  confidence?: number;
};

type ImportDraftInput = {
  sourceType: SourceType;
  sourceUrl: string;
};

export type ImportedRecipeDraft = Awaited<ReturnType<typeof buildImportedRecipeDraft>>;

const fallbackIngredients = ["재료를 확인해 주세요"];
const fallbackSteps = ["원문을 보고 조리 순서를 확인해 주세요."];
const openAiModel = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const maxParserInputLength = 12000;

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

function getMetaContent(html: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escapedName}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escapedName}["'][^>]*>`,
    "i",
  );
  const content = html.match(pattern)?.[1] ?? html.match(reversePattern)?.[1];
  return content ? decodeBasicEntities(stripTags(content)) : "";
}

export function extractReadableTextFromHtml(html: string, sourceUrl: string) {
  const title = getPageTitle(html);
  const description =
    getMetaContent(html, "description") || getMetaContent(html, "og:description");
  const bodyMatch =
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ??
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ??
    html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch?.[1] ?? html;
  const cleanedBody = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const readableBody = splitLines(cleanedBody).join("\n");

  return [
    `URL: ${sourceUrl}`,
    title ? `제목: ${title}` : "",
    description ? `설명: ${description}` : "",
    readableBody ? `본문:\n${readableBody}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, maxParserInputLength);
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

export function buildImportQualityWarnings(
  imported: Pick<ImportedDraft, "ingredients" | "steps">,
  sourceType: SourceType,
) {
  const warnings = new Set<string>();

  if (sourceType === "youtube" && imported.ingredients.length === 0 && imported.steps.length === 0) {
    warnings.add(
      "유튜브 설명에서 레시피 정보를 충분히 찾지 못했어요. 재료와 조리 순서를 직접 확인해 주세요.",
    );
  }

  if (imported.ingredients.length === 0) {
    warnings.add("재료를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요.");
  }

  if (imported.steps.length === 0) {
    warnings.add("조리 순서를 충분히 가져오지 못했어요. 원문을 보고 확인해 주세요.");
  }

  return Array.from(warnings);
}

function getImportConfidence(warnings: string[]) {
  if (warnings.length === 0) {
    return 0.8;
  }

  if (warnings.length === 1) {
    return 0.5;
  }

  return 0.2;
}

export function shouldAutoSaveImportedRecipeDraft(
  draft: Pick<
    ImportedRecipeDraft,
    "ingredients" | "parseConfidence" | "parseWarnings" | "steps" | "title"
  >,
) {
  const hasEnoughIngredients = draft.ingredients.length >= 2;
  const hasEnoughSteps = draft.steps.length >= 2;
  const hasNoWarnings = draft.parseWarnings.length === 0;
  const hasEnoughConfidence = draft.parseConfidence >= 0.7;

  return Boolean(
    draft.title.trim() &&
      hasEnoughIngredients &&
      hasEnoughSteps &&
      hasNoWarnings &&
      hasEnoughConfidence,
  );
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

function getYoutubeVideoId(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);

    if (url.hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? "";
    }

    return url.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
}

export async function fetchYoutubeSourceText(sourceUrl: string) {
  const videoId = getYoutubeVideoId(sourceUrl);
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!videoId || !apiKey) {
    const title = await fetchYoutubeTitle(sourceUrl);
    return [
      title ? `유튜브 제목: ${title}` : "",
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, maxParserInputLength);
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`YouTube API failed: ${response.status}`);
  }

  const body = (await response.json()) as {
    items?: Array<{
      snippet?: {
        title?: string;
        description?: string;
        channelTitle?: string;
      };
    }>;
  };
  const snippet = body.items?.[0]?.snippet;

  if (!snippet) {
    throw new Error("YouTube video not found");
  }

  return [
    `URL: ${sourceUrl}`,
    snippet.title ? `제목: ${snippet.title}` : "",
    snippet.channelTitle ? `채널: ${snippet.channelTitle}` : "",
    snippet.description ? `설명:\n${snippet.description}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, maxParserInputLength);
}

function parseOpenAiOutputText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const record = value as { output_text?: unknown; output?: unknown };
  if (typeof record.output_text === "string") {
    return record.output_text;
  }

  if (!Array.isArray(record.output)) {
    return "";
  }

  for (const item of record.output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (part && typeof part === "object") {
        const text = (part as { text?: unknown }).text;
        if (typeof text === "string") {
          return text;
        }
      }
    }
  }

  return "";
}

function normalizeLlmDraft(value: unknown, sourceUrl: string): ImportedDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = asText(record.title);
  const servings = asText(record.servings);
  const ingredients = parseIngredients(record.ingredients);
  const steps = parseIngredients(record.steps);
  const warnings = parseIngredients(record.warnings);
  const confidence =
    typeof record.confidence === "number" && Number.isFinite(record.confidence)
      ? Math.max(0, Math.min(1, record.confidence))
      : undefined;

  if (!title && ingredients.length === 0 && steps.length === 0) {
    return null;
  }

  return {
    title: title || sourceUrl,
    servings: servings || undefined,
    ingredients,
    steps,
    warnings,
    confidence,
  };
}

async function parseRecipeWithLlm(input: {
  sourceType: SourceType;
  sourceUrl: string;
  sourceText: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !input.sourceText.trim()) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: openAiModel,
      input: [
        {
          role: "system",
          content:
            "너는 한국어 레시피 링크 import 파서다. 입력 텍스트에서 실제 요리 레시피만 추출한다. 광고, 댓글, 추천글, 저작권 문구, 관련 글은 제외한다. 불확실한 값은 만들지 말고 warnings에 적는다.",
        },
        {
          role: "user",
          content: `sourceType: ${input.sourceType}\nsourceUrl: ${input.sourceUrl}\n\n${input.sourceText}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "recipe_import",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              servings: { type: "string" },
              ingredients: {
                type: "array",
                items: { type: "string" },
              },
              steps: {
                type: "array",
                items: { type: "string" },
              },
              warnings: {
                type: "array",
                items: { type: "string" },
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
              },
            },
            required: ["title", "servings", "ingredients", "steps", "warnings", "confidence"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI parser failed: ${response.status}`);
  }

  const body = await response.json();
  const outputText = parseOpenAiOutputText(body);

  if (!outputText) {
    throw new Error("OpenAI parser returned no text");
  }

  return normalizeLlmDraft(JSON.parse(outputText), input.sourceUrl);
}

export async function buildImportedRecipeDraft(input: ImportDraftInput) {
  let imported: ImportedDraft;
  let importFailed = false;

  try {
    if (input.sourceType === "youtube") {
      const sourceText = await fetchYoutubeSourceText(input.sourceUrl);
      imported =
        (await parseRecipeWithLlm({
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          sourceText,
        })) ?? {
          title: sourceText.replace(/^유튜브 제목:\s*/, "").trim() || "유튜브 레시피",
          ingredients: [],
          steps: [],
        };
    } else {
      const html = await fetchText(input.sourceUrl);
      imported =
        (await parseRecipeWithLlm({
          sourceType: input.sourceType,
          sourceUrl: input.sourceUrl,
          sourceText: extractReadableTextFromHtml(html, input.sourceUrl),
        })) ?? parseRecipeHtmlDraft(html, input.sourceUrl);
    }
  } catch (error) {
    console.error("Failed to import recipe draft", error);
    importFailed = true;
    imported = {
      title: input.sourceType === "youtube" ? "유튜브 레시피" : "웹 레시피",
      ingredients: [],
      steps: [],
    };
  }

  const warnings = [
    ...buildImportQualityWarnings(imported, input.sourceType),
    ...(imported.warnings ?? []),
  ];
  if (importFailed) {
    warnings.unshift("링크 내용을 가져오지 못했어요. 제목, 재료, 조리 순서를 직접 확인해 주세요.");
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
    parseConfidence: imported.confidence ?? getImportConfidence(warnings),
    parseWarnings: warnings,
  };
}
