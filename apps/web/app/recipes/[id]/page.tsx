import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusPanel } from "@/components/status-panel";
import { getRecipeById } from "@/lib/mock-data";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border border-[#eadccd] bg-[#fffaf3] shadow-[0_14px_42px_rgba(51,33,20,0.08)]">
          <Image
            src={recipe.thumbnailUrl}
            alt=""
            width={640}
            height={360}
            className="h-64 w-full object-cover sm:h-80"
          />
          <div className="p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7564]">
              {recipe.sourceType === "youtube" ? "YouTube" : "Web"} · {recipe.servings}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#211b16]">
              {recipe.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="#steps"
                className="inline-flex h-11 items-center rounded-full bg-[#2f6f5e] px-5 text-sm font-semibold text-white hover:bg-[#285f51]"
              >
                요리 시작
              </Link>
              <a
                href={recipe.sourceUrl}
                className="inline-flex h-11 items-center rounded-full border border-[#d7c5b5] bg-white px-5 text-sm font-semibold text-[#211b16] hover:bg-[#f8efe5]"
              >
                원본 보기
              </a>
            </div>
          </div>
          <div className="grid gap-7 border-t border-[#eadccd] p-5 sm:p-7">
            <div>
              <h2 className="text-lg font-semibold text-[#211b16]">재료</h2>
              <ul className="mt-3 grid gap-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.rawText}
                    className="rounded-lg bg-[#f4eadf] px-4 py-3 text-[15px] font-medium text-[#3f342d]"
                  >
                    {ingredient.rawText}
                  </li>
                ))}
              </ul>
            </div>
            <div id="steps">
              <h2 className="text-lg font-semibold text-[#211b16]">조리 순서</h2>
              <ol className="mt-4 grid gap-4">
                {recipe.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-[15px] leading-7 text-[#3f342d]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#211b16] text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <StatusPanel title="가격 힌트">
            {recipe.priceHint.summary}. 정확한 총 재료비가 아니라 메뉴 선택을 돕는 신호예요.
          </StatusPanel>
          <StatusPanel title="추천 이유">{recipe.reason}</StatusPanel>
          <StatusPanel title="요리 중 보기">
            모바일 화면에서도 재료와 순서를 크게 볼 수 있게 구성했습니다.
          </StatusPanel>
        </aside>
      </div>
    </AppShell>
  );
}
