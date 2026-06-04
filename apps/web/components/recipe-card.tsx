import Link from "next/link";
import Image from "next/image";
import type { MockRecipe } from "@/lib/mock-data";

const priceTone: Record<MockRecipe["priceHint"]["band"], string> = {
  cheap: "bg-[#dcefe6] text-[#1f5b4f]",
  normal: "bg-[#e8ecf2] text-[#34405d]",
  expensive: "bg-[#f4dddd] text-[#7a2f2f]",
  unknown: "bg-[#ece6dd] text-[#62564d]",
};

export function RecipeCard({ recipe }: { recipe: MockRecipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group grid grid-cols-[92px_minmax(0,1fr)] overflow-hidden rounded-lg border border-[#d8d0c6] bg-[#fffdfa] transition hover:border-[#b8aa9b] hover:bg-white sm:grid-cols-[132px_minmax(0,1fr)]"
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
            <h2 className="min-w-0 truncate text-base font-bold text-[#1f2420] group-hover:underline">
              {recipe.title}
            </h2>
            {recipe.status === "needs_review" ? (
              <span className="shrink-0 rounded-full bg-[#fff0cf] px-2 py-1 text-[11px] font-bold text-[#805b18]">
                확인
              </span>
            ) : null}
          </div>
          <p className="text-xs font-semibold text-[#756b61]">
            {recipe.servings} · {recipe.sourceType === "youtube" ? "YouTube" : "Web"}
          </p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-[#4f4840]">{recipe.reason}</p>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${priceTone[recipe.priceHint.band]}`}
        >
          {recipe.priceHint.summary}
        </span>
      </div>
    </Link>
  );
}
