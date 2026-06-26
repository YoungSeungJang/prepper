import { validateRecipeUrl } from "@prepper/shared";

type RecipeImportUrlResult =
  | {
      ok: true;
      sourceUrl: string;
      sourceType: "youtube" | "web";
      youtubeVideoId?: string;
    }
  | { ok: false; destination: string; message: string; sourceUrl: string };

function buildImportErrorDestination(basePath: string, params: URLSearchParams) {
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}${params.toString()}`;
}

export function validateRecipeImportUrl(
  rawUrl: string,
  errorBasePath = "/",
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
      message: validation.message,
      sourceUrl: rawUrl,
    };
  }

  return {
    ok: true,
    sourceUrl: validation.url.toString(),
    sourceType: validation.sourceType,
    youtubeVideoId: validation.youtubeVideoId,
  };
}
