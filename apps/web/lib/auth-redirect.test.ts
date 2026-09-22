import { describe, expect, it } from "vitest";
import { buildAuthCallbackUrl, getPublicRequestOrigin, getSafeNextPath } from "./auth-redirect";

describe("getSafeNextPath", () => {
  it("allows internal app paths", () => {
    expect(getSafeNextPath("/?recipe=recipe-1")).toBe("/?recipe=recipe-1");
  });

  it("falls back for external or missing paths", () => {
    expect(getSafeNextPath("https://example.com")).toBe("/");
    expect(getSafeNextPath("//example.com")).toBe("/");
    expect(getSafeNextPath(null)).toBe("/");
  });

  it("builds an internal auth callback URL with the next path", () => {
    expect(buildAuthCallbackUrl("http://localhost:3000", "/?recipe=recipe-1")).toBe(
      "http://localhost:3000/auth/callback?next=%2F%3Frecipe%3Drecipe-1",
    );
  });

  it("uses forwarded headers for the public request origin", () => {
    const request = new Request("https://0.0.0.0:3000/auth/callback?code=test", {
      headers: {
        "x-forwarded-host": "prepperapp.duckdns.org",
        "x-forwarded-proto": "https",
      },
    });

    expect(getPublicRequestOrigin(request)).toBe("https://prepperapp.duckdns.org");
  });

  it("falls back to the request URL origin when forwarded headers are missing", () => {
    const request = new Request("http://localhost:3000/auth/callback?code=test");

    expect(getPublicRequestOrigin(request)).toBe("http://localhost:3000");
  });
});
