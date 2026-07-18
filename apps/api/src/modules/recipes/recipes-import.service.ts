import {
  buildImportedRecipeDraft,
  type ImportedRecipeDraft,
} from "./recipes-import.parser.js";
import type { RecipeRepository, SourceType } from "./recipes.types.js";

type DraftBuilder = (input: {
  sourceType: SourceType;
  sourceUrl: string;
}) => Promise<ImportedRecipeDraft>;

type ImportRecipeInput = {
  draftBuilder?: DraftBuilder;
  recipes: RecipeRepository;
  sourceUrl: string;
  token: string;
  userId: string;
};

type RecipeImportUrlResult =
  | {
      ok: true;
      sourceUrl: string;
      sourceType: SourceType;
      youtubeVideoId?: string;
    }
  | { ok: false; message: string; sourceUrl: string };

const blockedHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function isBlockedHost(hostname: string) {
  return (
    blockedHosts.has(hostname) ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function getYoutubeVideoId(url: URL) {
  if (url.hostname === "youtu.be") {
    return url.pathname.slice(1) || undefined;
  }

  if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/").filter(Boolean)[1];
      return id || undefined;
    }
    return url.searchParams.get("v") ?? undefined;
  }

  return undefined;
}

function validateRecipeImportUrl(rawUrl: string): RecipeImportUrlResult {
  if (!rawUrl.trim()) {
    return { ok: false, message: "링크를 입력해주세요", sourceUrl: rawUrl };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, message: "올바른 링크가 아니에요", sourceUrl: rawUrl };
  }

  if ((url.protocol !== "http:" && url.protocol !== "https:") || isBlockedHost(url.hostname)) {
    return { ok: false, message: "지원하지 않는 링크입니다", sourceUrl: rawUrl };
  }

  const youtubeVideoId = getYoutubeVideoId(url);

  return {
    ok: true,
    sourceUrl: url.toString(),
    sourceType: youtubeVideoId ? "youtube" : "web",
    youtubeVideoId,
  };
}

export async function importRecipe({
  draftBuilder = buildImportedRecipeDraft,
  recipes,
  sourceUrl,
  token,
  userId,
}: ImportRecipeInput) {
  const validation = validateRecipeImportUrl(sourceUrl.trim());

  if (!validation.ok) {
    return {
      error: validation.message,
      sourceUrl: validation.sourceUrl,
      status: "invalid_url" as const,
    };
  }

  const existingRecipe = await recipes.findRecipeBySourceUrl({
    sourceUrl: validation.sourceUrl,
    token,
    userId,
  });

  if (existingRecipe) {
    return {
      existingStatus: existingRecipe.status,
      recipeId: existingRecipe.id,
      status: "duplicate" as const,
    };
  }

  const draft = await draftBuilder({
    sourceType: validation.sourceType,
    sourceUrl: validation.sourceUrl,
  });

  const recipeId = await recipes.createReviewDraft({
    draft,
    parseConfidence: draft.parseConfidence,
    parseWarnings: draft.parseWarnings,
    sourceVideoId: validation.youtubeVideoId,
    token,
    userId,
  });

  return {
    recipeId,
    status: "needs_review" as const,
  };
}
