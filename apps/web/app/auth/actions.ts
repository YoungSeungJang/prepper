"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { buildAuthCallbackUrl, getSafeNextPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function requestEmailOtpAction(formData: FormData) {
  const email = getFormString(formData, "email").toLowerCase();
  const next = getSafeNextPath(formData.get("next"));

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("이메일을 입력해 주세요.")}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(origin, next),
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(
      `/login?email=${encodeURIComponent(email)}&error=${encodeURIComponent("로그인 링크를 보낼 수 없습니다.")}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(
    `/login?email=${encodeURIComponent(email)}&sent=1&next=${encodeURIComponent(next)}`,
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
