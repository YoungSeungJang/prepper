import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RecommendationList } from "@/components/recommendation-list";
import { StatusPanel } from "@/components/status-panel";
import { TodayRecommendation } from "@/components/today-recommendation";
import { getCurrentUser } from "@/lib/auth";
import { mockRecipes } from "@/lib/mock-data";
import { countReviewDrafts, listSavedRecipes } from "@/lib/recipes/queries";

export default async function Home() {
  const user = await getCurrentUser();
  const recipes = user ? await listSavedRecipes() : mockRecipes;
  const recommendedRecipes = recipes.filter((recipe) => recipe.status === "saved");
  const todayRecipe = recommendedRecipes[0];
  const needsReviewCount = user
    ? await countReviewDrafts()
    : mockRecipes.filter((recipe) => recipe.status === "needs_review").length;

  return (
    <AppShell>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#276f5f]">저녁 메뉴</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1f2420]">
            오늘 먹을 만한 레시피
          </h1>
        </div>
        <div className="hidden sm:block">
          <Link
            href="/recipes/new"
            className="inline-flex h-11 items-center rounded-full bg-[#276f5f] px-5 text-sm font-bold text-white hover:bg-[#1f5b4f]"
          >
            레시피 추가
          </Link>
        </div>
      </div>

      {todayRecipe ? <TodayRecommendation recipe={todayRecipe} /> : null}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[#1f2420]">
            최근 저장한 레시피
          </h2>
          <Link href="/recipes" className="text-sm font-bold text-[#276f5f]">
            모두 보기
          </Link>
        </div>
        <RecommendationList recipes={recipes} />
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <StatusPanel title="확인 필요한 레시피">
          저장 전 검토가 필요한 레시피가 {needsReviewCount}개 있습니다.
        </StatusPanel>
        <StatusPanel title="추천 기준">
          저장일, 주요 재료 가격대, 확인 필요 여부를 함께 봅니다.
        </StatusPanel>
      </section>
    </AppShell>
  );
}
