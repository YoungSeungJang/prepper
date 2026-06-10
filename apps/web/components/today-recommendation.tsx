import Image from "next/image";
import Link from "next/link";
import type { RecipeListItem } from "@/lib/recipes/types";

export function TodayRecommendation({ recipe }: { recipe: RecipeListItem }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#d8d0c6] bg-[#fffdfa] shadow-[0_18px_40px_rgba(34,29,24,0.08)]">
      <div className="grid sm:grid-cols-[minmax(0,1fr)_340px]">
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#276f5f]">
            오늘의 추천
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2420] sm:text-4xl">
            {recipe.title}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#4f4840]">{recipe.reason}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/recipes/${recipe.id}`}
              className="inline-flex h-11 items-center rounded-full bg-[#276f5f] px-5 text-sm font-bold text-white hover:bg-[#1f5b4f]"
            >
              레시피 보기
            </Link>
            <Link
              href="/recipes"
              className="inline-flex h-11 items-center rounded-full border border-[#d8d0c6] bg-white px-5 text-sm font-bold text-[#1f2420] hover:bg-[#f0ebe4]"
            >
              다른 메뉴
            </Link>
          </div>
        </div>
        <div className="relative min-h-52 bg-[#ece6dd] sm:min-h-full">
          <Image
            src={recipe.thumbnailUrl}
            alt=""
            width={960}
            height={540}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#d8d0c6] border-t border-[#d8d0c6] bg-[#f3eee7]">
        <div className="p-4">
          <p className="text-[11px] font-bold text-[#756b61]">인분</p>
          <p className="mt-1 text-sm font-bold text-[#1f2420]">{recipe.servings}</p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-bold text-[#756b61]">가격 힌트</p>
          <p className="mt-1 text-sm font-bold text-[#1f2420]">{recipe.priceHint.summary}</p>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-bold text-[#756b61]">주요 재료</p>
          <p className="mt-1 truncate text-sm font-bold text-[#1f2420]">
            {recipe.ingredients[0]?.rawText ?? "확인 필요"}
          </p>
        </div>
      </div>
    </section>
  );
}
