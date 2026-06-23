"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { buildAuthCallbackUrl, getSafeNextPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

const socialProviders = ["kakao", "google"] as const;
type SocialProvider = (typeof socialProviders)[number];

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isSocialProvider(value: string): value is SocialProvider {
  return socialProviders.includes(value as SocialProvider);
}

export async function signInWithSocialAction(formData: FormData) {
  const provider = getFormString(formData, "provider");
  const next = getSafeNextPath(formData.get("next"));

  if (!isSocialProvider(provider)) {
    redirect(`/login?error=${encodeURIComponent("지원하지 않는 로그인 방식입니다.")}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: buildAuthCallbackUrl(origin, next),
    },
  });

  if (error || !data.url) {
    console.error("Failed to start Supabase OAuth login", {
      provider,
      message: error?.message,
      code: error?.code,
      status: error?.status,
    });

    redirect(
      `/login?error=${encodeURIComponent("소셜 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.")}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
