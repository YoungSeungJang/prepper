type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export function getLoginLinkErrorMessage(error: AuthErrorLike) {
  const message = error.message?.toLowerCase() ?? "";
  const code = error.code?.toLowerCase() ?? "";

  if (
    error.status === 429 ||
    code.includes("rate") ||
    message.includes("rate") ||
    message.includes("security purposes") ||
    message.includes("after")
  ) {
    return "메일 발송 제한에 걸렸습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (message.includes("not authorized")) {
    return "Supabase 기본 메일 서버는 팀에 등록된 이메일에만 보낼 수 있습니다.";
  }

  return "로그인 링크를 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.";
}
