"use server";

import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth-redirect";
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
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(
      `/login?email=${encodeURIComponent(email)}&error=${encodeURIComponent("인증 코드를 보낼 수 없습니다.")}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(
    `/login?email=${encodeURIComponent(email)}&sent=1&next=${encodeURIComponent(next)}`,
  );
}

export async function verifyEmailOtpAction(formData: FormData) {
  const email = getFormString(formData, "email").toLowerCase();
  const token = getFormString(formData, "token");
  const next = getSafeNextPath(formData.get("next"));

  if (!email || !token) {
    redirect(
      `/login?email=${encodeURIComponent(email)}&sent=1&error=${encodeURIComponent("이메일과 인증 코드를 확인해 주세요.")}&next=${encodeURIComponent(next)}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    redirect(
      `/login?email=${encodeURIComponent(email)}&sent=1&error=${encodeURIComponent("인증 코드가 맞지 않거나 만료됐습니다.")}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
