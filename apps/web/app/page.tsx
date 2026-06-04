import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RecommendationList } from "@/components/recommendation-list";
import { StatusPanel } from "@/components/status-panel";
import { TodayRecommendation } from "@/components/today-recommendation";
import { mockRecipes } from "@/lib/mock-data";

export default function Home() {
  const recommendedRecipes = mockRecipes.filter((recipe) => recipe.status === "saved");
  const todayRecipe = recommendedRecipes[0];
  const needsReviewCount = mockRecipes.filter((recipe) => recipe.status === "needs_review").length;

  return (
    <AppShell>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#8a7564]">저녁 메뉴 고르는 중이라면</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#211b16]">
            오늘은 이거 해먹자
          </h1>
        </div>
        <div className="hidden sm:block">
          <Link
            href="/recipes/new"
            className="inline-flex h-11 items-center rounded-full bg-[#2f6f5e] px-5 text-sm font-semibold text-white hover:bg-[#285f51]"
          >
            레시피 추가
          </Link>
        </div>
      </div>

      {todayRecipe ? <TodayRecommendation recipe={todayRecipe} /> : null}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-[#211b16]">
            최근 저장한 레시피
          </h2>
          <Link href="/recipes" className="text-sm font-semibold text-[#2f6f5e]">
            모두 보기
          </Link>
        </div>
        <RecommendationList recipes={mockRecipes} />
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <StatusPanel title="확인 필요한 레시피">
          저장 전 검토가 필요한 레시피가 {needsReviewCount}개 있습니다.
        </StatusPanel>
        <StatusPanel title="가격 힌트">
          가격 정보는 참고만 해주세요. 정확한 총 재료비가 아니라 메뉴 선택을 돕는 신호예요.
        </StatusPanel>
      </section>
    </AppShell>
  );
}
