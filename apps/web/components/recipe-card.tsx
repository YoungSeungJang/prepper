import Link from "next/link";
import { getRecipeHref } from "@/lib/recipe-status";
import type { RecipeListItem } from "@/lib/recipes/types";

const priceTone: Record<RecipeListItem["priceHint"]["band"], string> = {
  cheap: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  normal: "bg-slate-100 text-slate-700 ring-slate-200",
  expensive: "bg-rose-50 text-rose-700 ring-rose-200",
  unknown: "bg-slate-100 text-slate-500 ring-slate-200",
};

export function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const sourceLabel = recipe.sourceType === "youtube" ? "YouTube" : "Web";
  const primaryIngredients = recipe.ingredients
    .slice(0, 3)
    .map((ingredient) => ingredient.rawText)
    .join(" · ");

  return (
    <Link
      href={getRecipeHref(recipe)}
      className="group block rounded-lg border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-slate-950 group-hover:underline">
              {recipe.title}
            </h2>
            {recipe.status === "needs_review" ? (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                확인 필요
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {sourceLabel} · {recipe.servings}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${priceTone[recipe.priceHint.band]}`}
        >
          {recipe.priceHint.summary}
        </span>
      </div>
      <p className="mt-3 line-clamp-1 text-sm text-slate-600">
        {primaryIngredients || "재료 확인 필요"}
      </p>
    </Link>
  );
}
