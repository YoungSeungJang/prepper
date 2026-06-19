import Link from "next/link";
import type { RecipeListItem } from "@/lib/recipes/types";

export function TodayRecommendation({ recipe }: { recipe: RecipeListItem }) {
  const primaryIngredients = recipe.ingredients
    .slice(0, 4)
    .map((ingredient) => ingredient.rawText)
    .join(" · ");

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              최근 저장한 레시피
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {recipe.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {primaryIngredients || recipe.reason}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/recipes/${recipe.id}`}
              className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
            >
              열기
            </Link>
            <Link
              href="/recipes"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              저장함
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 bg-slate-50">
        <div className="p-4">
          <p className="text-[11px] font-medium text-slate-500">인분</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{recipe.servings}</p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-medium text-slate-500">가격</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{recipe.priceHint.summary}</p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-medium text-slate-500">주요 재료</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-950">
            {recipe.ingredients[0]?.rawText ?? "확인 필요"}
          </p>
        </div>
      </div>
    </section>
  );
}
