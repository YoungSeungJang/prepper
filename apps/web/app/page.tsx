import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RecommendationList } from "@/components/recommendation-list";
import { StatusPanel } from "@/components/status-panel";
import { getCurrentUser } from "@/lib/auth";
import { mockRecipes } from "@/lib/mock-data";
import { countReviewDrafts, listSavedRecipes } from "@/lib/recipes/queries";
import { startRecipeImportAction } from "./recipes/actions";

export default async function Home() {
  const user = await getCurrentUser();
  const recipes = user ? await listSavedRecipes() : mockRecipes;
  const recentRecipes = recipes.filter((recipe) => recipe.status === "saved").slice(0, 3);
  const needsReviewCount = user
    ? await countReviewDrafts()
    : mockRecipes.filter((recipe) => recipe.status === "needs_review").length;

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fbfbfa] text-slate-950">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Prepper
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            로그인
          </Link>
        </header>

        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(460px,1.14fr)] lg:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-slate-500">Recipe link organizer</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl">
              레시피 링크를 요리용 노트로 바꿉니다.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              YouTube, Shorts, 블로그에 흩어진 레시피에서 재료와 조리 순서만 정리해
              저장하세요. 긴 원문은 남겨두고, 요리할 때 필요한 내용만 빠르게 봅니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?next=%2F"
                className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-800"
              >
                레시피 저장 시작하기
              </Link>
              <Link
                href="/login?next=%2Frecipes%2Fnew"
                className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                링크 가져오기 보기
              </Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              실제 파싱과 저장은 로그인 후 진행됩니다.
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
            <div className="rounded-[14px] border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-medium text-slate-400">원본 링크</p>
                  <p className="mt-1 text-sm text-slate-200">youtube.com/shorts/jeyuk-recipe</p>
                </div>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                  YouTube
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Before
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                    <p>영상 설명, 댓글, 광고 문구가 섞여 있습니다.</p>
                    <p>재료와 순서를 다시 찾으려면 원문을 계속 오가야 합니다.</p>
                    <div className="rounded-md bg-white/[0.06] p-3 text-xs leading-5 text-slate-400">
                      고정댓글 참고 / 재료는 영상 중간 / 자세한 계량은 설명란...
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-4 text-slate-950">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    After
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    제육볶음
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">저장 전 확인 초안</p>
                  <div className="mt-5 grid gap-4">
                    <div>
                      <p className="text-sm font-semibold">재료</p>
                      <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                        <li className="rounded-md bg-slate-50 px-3 py-2">돼지고기 앞다리살 300g</li>
                        <li className="rounded-md bg-slate-50 px-3 py-2">양파 1/2개</li>
                        <li className="rounded-md bg-slate-50 px-3 py-2">고추장 1큰술</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">조리 순서</p>
                      <ol className="mt-2 grid gap-2 text-sm leading-6 text-slate-700">
                        <li>1. 재료를 먹기 좋은 크기로 썹니다.</li>
                        <li>2. 양념을 섞고 고기에 버무립니다.</li>
                        <li>3. 팬에서 충분히 볶아 마무리합니다.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-3 px-5 pb-16 sm:px-8 md:grid-cols-3">
          <div className="border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-950">링크에서 추출</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              YouTube, Shorts, 웹 레시피에서 제목, 재료, 조리 순서 후보를 가져옵니다.
            </p>
          </div>
          <div className="border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-950">저장 전 검토</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              자동 추출 결과를 그대로 믿지 않고 저장 전에 직접 고칠 수 있습니다.
            </p>
          </div>
          <div className="border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-950">재료 정보 확장</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              이후 재료별 상품 후보와 상품별 가격 변동을 연결할 예정입니다.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AppShell>
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-slate-500">Recipe import</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            레시피 링크를 저장하기 쉬운 형태로 정리하세요.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            YouTube, Shorts, 블로그 링크를 붙여넣으면 재료와 조리 순서를 추출하고,
            저장 전에 직접 확인할 수 있습니다.
          </p>
        </div>
        <form action={startRecipeImportAction} className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="sr-only" htmlFor="home-source-url">
            레시피 링크
          </label>
          <input name="nextPath" type="hidden" value="/recipes/new" />
          <input
            id="home-source-url"
            name="sourceUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-12 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            className="h-12 rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-700"
          >
            레시피 정리하기
          </button>
        </form>
        {!user ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            저장과 파싱은 로그인 후 진행됩니다. 이메일 링크로 저장함을 만들 수 있습니다.
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <StatusPanel title="검토 필요한 초안">
          저장 전 확인이 필요한 레시피가 {needsReviewCount}개 있습니다.
        </StatusPanel>
        <StatusPanel title="가격 정보">
          다음 단계에서 재료별 상품 후보와 상품별 가격 변동을 연결합니다.
        </StatusPanel>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">
            최근 저장한 레시피
          </h2>
          <Link href="/recipes" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            모두 보기
          </Link>
        </div>
        <RecommendationList recipes={recentRecipes} />
      </section>
    </AppShell>
  );
}
