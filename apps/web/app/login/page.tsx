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
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6">
        {user ? (
          <>
            <p className="text-sm font-medium text-slate-500">로그인됨</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              저장함을 열 수 있습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {user.email} 계정으로 로그인되어 있습니다.
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                href="/recipes"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
              >
                저장함으로 이동
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="h-11 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-500">
              저장한 레시피를 다시 열려면
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              이메일 링크로 시작하기
            </h1>
            {error ? (
              <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                {error}
              </p>
            ) : null}
            {sent ? (
              <div className="mt-6 rounded-md bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 ring-1 ring-slate-200">
                {email} 주소로 로그인 링크를 보냈습니다. 메일의 링크를 클릭하면 저장함으로
                이동합니다.
              </div>
            ) : (
              <form action={requestEmailOtpAction} className="mt-6 grid gap-4">
                <input name="next" type="hidden" value={next} />
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="email">
                    이메일
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email}
                    placeholder="you@example.com"
                    className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
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
