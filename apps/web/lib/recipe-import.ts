import { validateRecipeUrl } from "@prepper/shared";

type ImportRedirectResult =
  | { ok: true; destination: string }
  | { ok: false; destination: string };

export function buildRecipeImportRedirect(rawUrl: string): ImportRedirectResult {
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

  const params = new URLSearchParams({
    sourceUrl: validation.url.toString(),
    sourceType: validation.sourceType,
  });

  if (validation.youtubeVideoId) {
    params.set("youtubeVideoId", validation.youtubeVideoId);
  }

  return {
    ok: true,
    destination: `/recipes/jeyuk/review?${params.toString()}`,
  };
}
