import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusPanel } from "@/components/status-panel";
import { requireUser } from "@/lib/auth";
import { getRecipeById } from "@/lib/mock-data";
import { getRecipe } from "@/lib/recipes/queries";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/recipes/${id}`);

  const recipe = (await getRecipe(id)) ?? getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const sourceLabel = recipe.sourceType === "youtube" ? "YouTube" : "Web";

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              {sourceLabel} · {recipe.servings}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {recipe.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {recipe.reason}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="#steps"
                className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
              >
                조리 순서로 이동
              </Link>
              <a
                href={recipe.sourceUrl}
                className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                원본 보기
              </a>
            </div>
          </div>
          <div className="grid gap-7 p-5 sm:p-7">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">재료</h2>
              <ul className="mt-3 grid gap-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.rawText}
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-medium text-slate-700"
                  >
                    {ingredient.rawText}
                  </li>
                ))}
              </ul>
            </div>
            <div id="steps">
              <h2 className="text-lg font-semibold text-slate-950">조리 순서</h2>
              <ol className="mt-4 grid gap-4">
                {recipe.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-[15px] leading-7 text-slate-700">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
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
            {sourceLabel} · {recipe.servings}
          </StatusPanel>
        </aside>
      </div>
    </AppShell>
  );
}
