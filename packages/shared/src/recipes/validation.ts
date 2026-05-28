import type { SourceType } from "./types";

const blockedHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export type UrlValidationResult =
  | {
      ok: true;
      url: URL;
      sourceType: SourceType;
      youtubeVideoId?: string;
    }
  | { ok: false; message: string };

export function validateRecipeUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl.trim()) {
    return { ok: false, message: "링크를 입력해주세요" };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, message: "올바른 링크가 아니에요" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, message: "지원하지 않는 링크입니다" };
  }

  if (isBlockedHost(url.hostname)) {
    return { ok: false, message: "지원하지 않는 링크입니다" };
  }

  const youtubeVideoId = getYoutubeVideoId(url);

  return {
    ok: true,
    url,
    sourceType: youtubeVideoId ? "youtube" : "web",
    youtubeVideoId,
  };
}

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
    return url.searchParams.get("v") ?? undefined;
  }

  return undefined;
}
