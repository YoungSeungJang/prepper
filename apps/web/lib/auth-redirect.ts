export function getSafeNextPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function buildAuthCallbackUrl(origin: string, nextPath: string) {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", getSafeNextPath(nextPath));
  return callbackUrl.toString();
}

function getForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

export function getPublicRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = getForwardedValue(request.headers.get("x-forwarded-host"));

  if (!forwardedHost) {
    return requestUrl.origin;
  }

  const forwardedProto = getForwardedValue(request.headers.get("x-forwarded-proto"));
  const protocol =
    forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : requestUrl.protocol.replace(":", "");

  return `${protocol}://${forwardedHost}`;
}
