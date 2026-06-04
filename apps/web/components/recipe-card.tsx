import Link from "next/link";
import Image from "next/image";
import type { MockRecipe } from "@/lib/mock-data";

const priceTone: Record<MockRecipe["priceHint"]["band"], string> = {
  cheap: "bg-[#dff3df] text-[#24513b]",
  normal: "bg-[#e9edf7] text-[#34405d]",
  expensive: "bg-[#f8dfdf] text-[#7a2f2f]",
  unknown: "bg-[#eee7df] text-[#62564d]",
};

export function RecipeCard({ recipe }: { recipe: MockRecipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group grid grid-cols-[96px_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#eadccd] bg-[#fffaf3] shadow-[0_8px_24px_rgba(51,33,20,0.05)] transition hover:border-[#dbc7b4] sm:grid-cols-[140px_minmax(0,1fr)]"
    >
      <Image
        src={recipe.thumbnailUrl}
        alt=""
        width={640}
        height={360}
        className="h-full min-h-32 w-full object-cover"
      />
      <div className="grid min-w-0 content-between gap-3 p-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="min-w-0 truncate text-base font-semibold text-[#211b16] group-hover:underline">
              {recipe.title}
            </h2>
            {recipe.status === "needs_review" ? (
              <span className="shrink-0 rounded-full bg-[#fff0cf] px-2 py-1 text-[11px] font-semibold text-[#805b18]">
                확인
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium text-[#8a7564]">
            {recipe.servings} · {recipe.sourceType === "youtube" ? "YouTube" : "Web"}
          </p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-[#4d4037]">{recipe.reason}</p>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${priceTone[recipe.priceHint.band]}`}
        >
          {recipe.priceHint.summary}
        </span>
      </div>
    </Link>
  );
}
