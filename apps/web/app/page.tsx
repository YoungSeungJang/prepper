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

        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(460px,1.14fr)] lg:items-center">
          <div className="prepper-fade-up max-w-xl">
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

          <div className="prepper-fade-up-delay-1 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
            <div className="rounded-[18px] border border-slate-200 bg-[#f8fafc] p-4">
              <div className="rounded-xl bg-slate-950 p-4 text-white">
                <p className="text-xs font-medium text-slate-400">붙여넣은 링크</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 rounded-lg bg-white/[0.06] px-3 py-3 text-sm text-slate-200">
                    youtube.com/shorts/jeyuk-recipe
                  </div>
                  <div className="flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-medium text-slate-950">
                    초안 만들기
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">저장 전 확인 초안</p>
                    <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                      제육볶음
                    </h2>
                  </div>
                  <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                    확인 필요
                  </span>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">재료</p>
                    <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                      <li className="rounded-md bg-slate-50 px-3 py-2">돼지고기 앞다리살 300g</li>
                      <li className="rounded-md bg-slate-50 px-3 py-2">양파 1/2개</li>
                      <li className="rounded-md bg-slate-50 px-3 py-2">고추장 1큰술</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">조리 순서</p>
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
        </section>

        <section className="prepper-fade-up-delay-2 mx-auto grid w-full max-w-6xl gap-3 px-5 pb-16 sm:px-8 md:grid-cols-3">
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

        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
          <div className="prepper-fade-up-delay-2 grid gap-8 border-t border-slate-200 pt-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-medium text-slate-500">Why Prepper</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                저장한 레시피는 많은데, 다시 요리할 때마다 찾기 어렵습니다.
              </h2>
            </div>
            <div className="grid gap-4 text-sm leading-7 text-slate-600 sm:grid-cols-2">
              <p>
                영상은 다시 돌려봐야 하고, 블로그는 광고와 긴 설명 사이에서 재료와 순서를
                다시 찾아야 합니다.
              </p>
              <p>
                Prepper는 원문을 대체하지 않습니다. 대신 요리할 때 필요한 핵심만 저장 전
                확인 가능한 형태로 정리합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="prepper-fade-up-delay-3 rounded-[20px] bg-slate-950 p-6 text-white sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-sm font-medium text-slate-400">Next</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  다음에는 재료에서 상품 정보로 이어집니다.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  저장한 레시피의 재료를 누르면 관련 상품 후보와 상품별 가격 변동을 볼 수
                  있는 방향으로 확장합니다.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["양파", "돼지고기", "고추장"].map((name) => (
                  <div key={name} className="rounded-xl bg-white/[0.06] p-4">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      상품 후보와 가격 변동을 연결할 재료
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
