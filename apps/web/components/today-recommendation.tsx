import Image from "next/image";
import Link from "next/link";
import type { MockRecipe } from "@/lib/mock-data";

export function TodayRecommendation({ recipe }: { recipe: MockRecipe }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-[#332012] text-white shadow-[0_18px_50px_rgba(51,32,18,0.22)]">
      <div className="relative h-64 sm:h-80">
        <Image
          src={recipe.thumbnailUrl}
          alt=""
          width={960}
          height={540}
          priority
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            오늘 먼저 볼 레시피
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {recipe.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/82">
            {recipe.reason}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/recipes/${recipe.id}`}
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#211b16] hover:bg-[#f4eadf]"
            >
              레시피 보기
            </Link>
            <Link
              href="/recipes"
              className="inline-flex h-11 items-center rounded-full bg-white/15 px-5 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
            >
              다른 메뉴
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-black/18">
        <div className="p-4">
          <p className="text-[11px] font-semibold text-white/55">인분</p>
          <p className="mt-1 text-sm font-semibold">{recipe.servings}</p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-semibold text-white/55">가격 힌트</p>
          <p className="mt-1 text-sm font-semibold">{recipe.priceHint.summary}</p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-semibold text-white/55">주요 재료</p>
          <p className="mt-1 truncate text-sm font-semibold">
            {recipe.ingredients[0]?.rawText ?? "확인 필요"}
          </p>
        </div>
      </div>
    </section>
  );
}
