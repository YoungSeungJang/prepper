import { NextResponse } from "next/server";
import { getPublicRequestOrigin, getSafeNextPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = getPublicRequestOrigin(request);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent("소셜 로그인에 실패했습니다. 다시 시도해 주세요.")}&next=${encodeURIComponent(next)}`,
      origin,
    ),
  );
}
