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
      <AppShell>
        <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-slate-500">Prepper</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              흩어진 레시피 링크를 요리하기 쉬운 저장함으로 정리하세요.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              YouTube, Shorts, 블로그에 저장해둔 레시피를 붙여넣으면 재료와 조리 순서를
              초안으로 정리합니다. 저장하기 전에 직접 확인하고 수정할 수 있습니다.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?next=%2F"
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-700"
            >
              레시피 저장 시작하기
            </Link>
            <Link
              href="/login?next=%2Frecipes%2Fnew"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              링크 가져오기
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <StatusPanel title="1. 링크 붙여넣기">
            YouTube, Shorts, 블로그 레시피 링크를 저장함에 추가합니다.
          </StatusPanel>
          <StatusPanel title="2. 초안 확인">
            자동으로 정리된 제목, 재료, 조리 순서를 저장 전에 검토합니다.
          </StatusPanel>
          <StatusPanel title="3. 다시 보기">
            저장한 레시피를 요리할 때 바로 열어보고 재료 정보를 확인합니다.
          </StatusPanel>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold tracking-tight text-slate-950">
                정리된 레시피 예시
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                링크 하나가 저장 전 확인 가능한 레시피 카드로 바뀝니다.
              </p>
            </div>
            <RecommendationList recipes={recentRecipes.slice(0, 2)} />
          </div>
          <div className="grid content-start gap-3">
            <StatusPanel title="지원하는 링크">
              YouTube 영상, Shorts, 일반 웹/블로그 레시피를 먼저 지원합니다.
            </StatusPanel>
            <StatusPanel title="가격 정보 방향">
              이후에는 재료를 눌러 상품 후보와 상품별 가격 변동을 확인할 수 있게
              확장합니다.
            </StatusPanel>
          </div>
        </section>
      </AppShell>
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
