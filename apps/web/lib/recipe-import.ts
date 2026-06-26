import { validateRecipeUrl } from "@prepper/shared";

type RecipeImportUrlResult =
  | {
      ok: true;
      sourceUrl: string;
      sourceType: "youtube" | "web";
      youtubeVideoId?: string;
    }
  | { ok: false; destination: string };

function buildImportErrorDestination(basePath: string, params: URLSearchParams) {
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}${params.toString()}`;
}

export function validateRecipeImportUrl(
  rawUrl: string,
  errorBasePath = "/?addRecipe=1",
): RecipeImportUrlResult {
  const validation = validateRecipeUrl(rawUrl);

  if (!validation.ok) {
    const params = new URLSearchParams({
      error: validation.message,
      sourceUrl: rawUrl,
    });

    return {
      ok: false,
      destination: buildImportErrorDestination(errorBasePath, params),
    };
  }

  return {
    ok: true,
    sourceUrl: validation.url.toString(),
    sourceType: validation.sourceType,
    youtubeVideoId: validation.youtubeVideoId,
  };
}
