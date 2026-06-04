import { describe, expect, it } from "vitest";
import { getLoginLinkErrorMessage } from "./auth-errors";

describe("getLoginLinkErrorMessage", () => {
  it("explains Supabase email rate limits", () => {
    expect(
      getLoginLinkErrorMessage({
        message: "For security purposes, you can only request this after 60 seconds",
      }),
    ).toBe("메일 발송 제한에 걸렸습니다. 잠시 후 다시 시도해 주세요.");
  });

  it("explains unauthorized email addresses", () => {
    expect(
      getLoginLinkErrorMessage({
        message: "Email address not authorized",
      }),
    ).toBe("Supabase 기본 메일 서버는 팀에 등록된 이메일에만 보낼 수 있습니다.");
  });
});
