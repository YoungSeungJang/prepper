import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requestEmailOtpAction, signOutAction } from "@/app/auth/actions";
import { getSafeNextPath } from "@/lib/auth-redirect";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const email = getSearchParam(params, "email");
  const error = getSearchParam(params, "error");
  const sent = getSearchParam(params, "sent") === "1";
  const next = getSafeNextPath(getSearchParam(params, "next"));

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-xl border border-[#d8d0c6] bg-[#fffdfa] p-6 shadow-[0_14px_34px_rgba(34,29,24,0.07)]">
        {user ? (
          <>
            <p className="text-sm font-bold text-[#276f5f]">로그인됨</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1f2420]">
              저장함을 열 수 있습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#625c54]">
              {user.email} 계정으로 로그인되어 있습니다.
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                href="/recipes"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#276f5f] px-4 text-sm font-bold text-white hover:bg-[#1f5b4f]"
              >
                저장함으로 이동
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="h-12 w-full rounded-full border border-[#d8d0c6] bg-white px-4 text-sm font-bold text-[#1f2420] hover:bg-[#f0ebe4]"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-[#276f5f]">
              저장한 레시피를 다시 열려면
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1f2420]">
              이메일 링크로 시작하기
            </h1>
            {error ? (
              <p className="mt-4 rounded-lg bg-[#f4dddd] px-3 py-2 text-sm font-semibold text-[#7a2f2f]">
                {error}
              </p>
            ) : null}
            {sent ? (
              <div className="mt-6 rounded-lg bg-[#dcefe6] px-4 py-3 text-sm font-semibold leading-6 text-[#1f5b4f]">
                {email} 주소로 로그인 링크를 보냈습니다. 메일의 링크를 클릭하면 저장함으로
                이동합니다.
              </div>
            ) : (
              <form action={requestEmailOtpAction} className="mt-6 grid gap-4">
                <input name="next" type="hidden" value={next} />
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-[#1f2420]" htmlFor="email">
                    이메일
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email}
                    placeholder="you@example.com"
                    className="h-12 rounded-lg border border-[#cfc6bb] bg-white px-3 text-sm outline-none focus:border-[#276f5f]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 rounded-full bg-[#276f5f] px-4 text-sm font-bold text-white hover:bg-[#1f5b4f]"
                >
                  로그인 링크 받기
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
