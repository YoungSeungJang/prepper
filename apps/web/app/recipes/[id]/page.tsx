import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusPanel } from "@/components/status-panel";
import { requireUser } from "@/lib/auth";
import { getRecipeById } from "@/lib/mock-data";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/recipes/${id}`);

  const recipe = getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-xl border border-[#d8d0c6] bg-[#fffdfa] shadow-[0_16px_36px_rgba(34,29,24,0.07)]">
          <div className="grid border-b border-[#d8d0c6] sm:grid-cols-[minmax(0,1fr)_280px]">
            <div className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#756b61]">
                {recipe.sourceType === "youtube" ? "YouTube" : "Web"} · {recipe.servings}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2420]">
                {recipe.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#625c54]">
                {recipe.reason}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="#steps"
                  className="inline-flex h-11 items-center rounded-full bg-[#276f5f] px-5 text-sm font-bold text-white hover:bg-[#1f5b4f]"
                >
                  요리 시작
                </Link>
                <a
                  href={recipe.sourceUrl}
                  className="inline-flex h-11 items-center rounded-full border border-[#d8d0c6] bg-white px-5 text-sm font-bold text-[#1f2420] hover:bg-[#f0ebe4]"
                >
                  원본 보기
                </a>
              </div>
            </div>
            <Image
              src={recipe.thumbnailUrl}
              alt=""
              width={640}
              height={360}
              className="h-56 w-full object-cover sm:h-full"
            />
          </div>
          <div className="grid gap-7 p-5 sm:p-7">
            <div>
              <h2 className="text-lg font-bold text-[#1f2420]">재료</h2>
              <ul className="mt-3 grid gap-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.rawText}
                    className="rounded-lg bg-[#f0ebe4] px-4 py-3 text-[15px] font-semibold text-[#3f342d]"
                  >
                    {ingredient.rawText}
                  </li>
                ))}
              </ul>
            </div>
            <div id="steps">
              <h2 className="text-lg font-bold text-[#1f2420]">조리 순서</h2>
              <ol className="mt-4 grid gap-4">
                {recipe.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-[15px] leading-7 text-[#3f342d]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f2420] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4 lg:sticky lg:top-24">
          <StatusPanel title="가격 힌트">
            {recipe.priceHint.summary}
          </StatusPanel>
          <StatusPanel title="추천 이유">{recipe.reason}</StatusPanel>
          <StatusPanel title="저장 정보">
            {recipe.sourceType === "youtube" ? "YouTube" : "Web"} · {recipe.servings}
          </StatusPanel>
        </aside>
      </div>
    </AppShell>
  );
}
