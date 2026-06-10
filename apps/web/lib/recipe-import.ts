import { validateRecipeUrl } from "@prepper/shared";

type RecipeImportUrlResult =
  | {
      ok: true;
      sourceUrl: string;
      sourceType: "youtube" | "web";
      youtubeVideoId?: string;
    }
  | { ok: false; destination: string };

export function validateRecipeImportUrl(rawUrl: string): RecipeImportUrlResult {
  const validation = validateRecipeUrl(rawUrl);

  if (!validation.ok) {
    const params = new URLSearchParams({
      error: validation.message,
      sourceUrl: rawUrl,
    });

    return {
      ok: false,
      destination: `/recipes/new?${params.toString()}`,
    };
  }

  return {
    ok: true,
    sourceUrl: validation.url.toString(),
    sourceType: validation.sourceType,
    youtubeVideoId: validation.youtubeVideoId,
  };
}
