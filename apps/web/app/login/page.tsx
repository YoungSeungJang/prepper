import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { signInWithSocialAction, signOutAction } from "@/app/auth/actions";
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
  const error = getSearchParam(params, "error");
  const next = getSafeNextPath(getSearchParam(params, "next"));

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {user ? (
          <>
            <p className="text-sm font-medium text-slate-500">로그인됨</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              홈으로 이동할 수 있습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {user.email} 계정으로 로그인되어 있습니다.
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
              >
                홈으로 이동
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
              소셜 계정으로 시작하기
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              별도 회원가입 없이 사용 중인 계정으로 Prepper 저장함을 만듭니다.
            </p>
            {error ? (
              <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                {error}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3">
              <form action={signInWithSocialAction}>
                <input name="next" type="hidden" value={next} />
                <input name="provider" type="hidden" value="kakao" />
                <button
                  type="submit"
                  className="h-12 w-full rounded-md bg-[#FEE500] px-4 text-sm font-semibold text-[#191919] transition hover:bg-[#f4dc00]"
                >
                  카카오로 계속하기
                </button>
              </form>
              <form action={signInWithSocialAction}>
                <input name="next" type="hidden" value={next} />
                <input name="provider" type="hidden" value="google" />
                <button
                  type="submit"
                  className="h-12 w-full rounded-md bg-white px-4 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Google로 계속하기
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
