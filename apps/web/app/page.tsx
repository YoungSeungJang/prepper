import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RecommendationList } from "@/components/recommendation-list";
import { getCurrentUser } from "@/lib/auth";
import { mockRecipes } from "@/lib/mock-data";
import { countReviewDrafts, listSavedRecipes } from "@/lib/recipes/queries";
import { startRecipeImportAction } from "./recipes/actions";

export default async function Home() {
  const user = await getCurrentUser();
  const recipes = user ? await listSavedRecipes() : mockRecipes;
  const recentRecipes = recipes.filter((recipe) => recipe.status === "saved").slice(0, 3);
  const needsReviewCount = user
    ? await countReviewDrafts()
    : mockRecipes.filter((recipe) => recipe.status === "needs_review").length;

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f1e8] text-[#201a14]">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Prepper 홈" className="inline-flex items-center">
            <Image
              src="/prepper_logo.png"
              alt="Prepper"
              width={1237}
              height={339}
              priority
              unoptimized
              className="h-12 w-auto sm:h-14"
            />
          </Link>
          <Link
            href="/login?next=%2Frecipes%2Fnew"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f3b22] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#25301b]"
          >
            레시피 정리하기
          </Link>
        </header>

        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-24 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(480px,1.14fr)] lg:items-center">
          <div className="prepper-fade-up max-w-xl">
            <p className="inline-flex rounded-full bg-white/75 px-3 py-1 text-sm font-medium text-[#6c5d4c] shadow-sm ring-1 ring-[#eadfce]">
              링크 정리
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.03] tracking-tight text-[#201a14] sm:text-6xl">
              저장만 해둔 레시피를 다시 요리할 수 있게.
            </h1>
            <p className="mt-5 text-base leading-8 text-[#695f52] sm:text-lg">
              YouTube, Shorts, 블로그 링크를 붙여넣으면 재료와 조리 순서를 저장 전
              초안으로 정리합니다. 원문은 남기고, 요리할 때 필요한 내용만 빠르게 봅니다.
            </p>
            <div className="mt-8">
              <Link
                href="/login?next=%2Frecipes%2Fnew"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#2f3b22] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#25301b]"
              >
                레시피 링크 정리하기
              </Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#7b6f61]">
              카카오 또는 Google 계정으로 바로 시작할 수 있습니다.
            </p>
          </div>

          <div className="prepper-fade-up-delay-1 rounded-[30px] bg-[#fffaf2] p-5 shadow-[0_30px_90px_rgba(78,61,39,0.16)] ring-1 ring-[#eadfce]">
            <div className="flex items-center justify-between gap-3 border-b border-[#eadfce] pb-4">
              <div>
                <p className="text-xs font-medium text-[#8a7a68]">새 레시피 초안</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-[#201a14]">제육볶음</p>
              </div>
              <span className="rounded-full bg-[#fff0c2] px-3 py-1 text-xs font-medium text-[#7a5420]">
                확인 필요
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-[#2b3320] p-4 text-white">
              <p className="text-xs font-medium text-white/55">붙여넣은 링크</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-3 text-sm text-white/80">
                  youtube.com/shorts/jeyuk-recipe
                </div>
                <div className="flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-[#2b3320]">
                  초안 만들기
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold text-[#201a14]">재료</p>
                <ul className="mt-3 grid gap-2 text-sm text-[#5f564b]">
                  {["돼지고기 앞다리살 300g", "양파 1/2개", "고추장 1큰술"].map((item) => (
                    <li key={item} className="rounded-xl bg-[#f4eadc] px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#201a14]">조리 순서</p>
                <ol className="mt-3 grid gap-2 text-sm leading-6 text-[#5f564b]">
                  <li>1. 재료를 먹기 좋은 크기로 썹니다.</li>
                  <li>2. 양념을 섞고 고기에 버무립니다.</li>
                  <li>3. 팬에서 충분히 볶아 마무리합니다.</li>
                </ol>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["원본 링크 유지", "저장 전 수정", "가격 정보 준비"].map((label) => (
                <div key={label} className="rounded-2xl bg-white px-3 py-3 text-sm font-medium text-[#4d463d] ring-1 ring-[#eadfce]">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="prepper-fade-up-delay-2 mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[30px] bg-[#2b3320] p-7 text-white shadow-[0_24px_70px_rgba(43,51,32,0.22)] sm:p-9">
              <p className="text-sm font-medium text-white/50">왜 필요한가</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                저장한 링크는 많은데, 막상 요리할 때는 다시 찾게 됩니다.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/70">
                영상은 다시 돌려봐야 하고, 블로그는 긴 설명 사이에서 재료와 순서를 찾아야
                합니다. Prepper는 링크를 없애지 않고, 요리할 때 보는 정보만 따로 정리합니다.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                ["링크는 흩어지고", "유튜브, 쇼츠, 블로그, 메신저에 저장한 레시피가 제각각 남습니다."],
                ["요리 중에는 느리고", "원문 전체보다 재료, 양념, 조리 순서만 빠르게 보고 싶습니다."],
                ["자동 정리는 검토가 필요하고", "원문에 없는 내용은 확정하지 않고 저장 전 확인 대상으로 남깁니다."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[24px] bg-white/80 p-6 shadow-sm ring-1 ring-[#eadfce]">
                  <h3 className="text-base font-semibold tracking-tight text-[#201a14]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#695f52]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="prepper-fade-up-delay-3">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[#7b6f61]">정리되는 것</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#201a14] sm:text-4xl">
                원문은 그대로 두고, 조리 화면에 필요한 정보만 남깁니다.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ["재료", "분량과 단위를 최대한 보존해 체크하기 쉬운 목록으로 정리합니다."],
                ["조리 순서", "긴 설명을 요리 흐름에 맞는 단계로 나눕니다."],
                ["원본 링크", "출처는 계속 남겨두어 필요할 때 원문으로 돌아갈 수 있습니다."],
                ["확인 필요", "정보가 부족하거나 애매한 항목은 저장 전 검토하도록 표시합니다."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[24px] bg-[#fffaf2] p-6 shadow-sm ring-1 ring-[#eadfce]">
                  <h3 className="text-base font-semibold tracking-tight text-[#201a14]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#695f52]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="prepper-fade-up-delay-3 rounded-[30px] bg-[#fffaf2] p-6 shadow-[0_24px_80px_rgba(78,61,39,0.10)] ring-1 ring-[#eadfce] sm:p-9">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-medium text-[#7b6f61]">다음 단계</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#201a14]">
                  재료에서 상품 후보와 가격 정보로 이어집니다.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#695f52]">
                  양파 하나에 임의 가격을 붙이지 않습니다. 재료를 누르면 관련 상품 후보를
                  보여주고, 상품별 가격 변동을 확인하는 방향으로 확장합니다.
                </p>
              </div>
              <div className="rounded-[24px] bg-[#2b3320] p-4 text-white">
                {[
                  ["양파", "국내산 햇양파 1.5kg", "최근 30일 가격 변동"],
                  ["돼지고기", "앞다리살 불고기용 500g", "상품 후보 비교"],
                  ["고추장", "태양초 고추장 1kg", "저장한 상품 추적"],
                ].map(([ingredient, product, note]) => (
                  <div key={ingredient} className="mb-3 rounded-2xl bg-white/10 p-4 last:mb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{ingredient}</p>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/65">
                        {note}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-white/70">{product}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
          <div className="prepper-fade-up-delay-3 rounded-[30px] bg-[#e4d4bd] p-7 text-center shadow-sm sm:p-10">
            <h2 className="text-3xl font-semibold tracking-tight text-[#201a14]">
              첫 레시피 링크부터 정리해보세요.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5f564b]">
              카카오 또는 Google 계정으로 시작하고, 링크를 붙여넣어 저장 전 초안을 만듭니다.
            </p>
            <div className="mt-7 flex justify-center">
              <Link
                href="/login?next=%2Frecipes%2Fnew"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#2f3b22] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#25301b]"
              >
                레시피 링크 정리하기
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-slate-500">오늘 정리할 링크</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              레시피 링크를 붙여넣고 초안을 확인하세요.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              YouTube, Shorts, 블로그 링크를 정리한 뒤 저장 전 검토 화면에서 재료와
              조리 순서를 바로 고칠 수 있습니다.
            </p>
          </div>

          <form action={startRecipeImportAction} className="mt-7 grid gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="home-source-url">
              레시피 URL
            </label>
            <input name="nextPath" type="hidden" value="/recipes/new" />
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                id="home-source-url"
                name="sourceUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-14 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
              <button
                type="submit"
                className="h-14 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                레시피 정리하기
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/recipes"
              className="inline-flex h-10 items-center rounded-lg bg-slate-100 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              저장함 보기
            </Link>
            <Link
              href="/recipes"
              className="inline-flex h-10 items-center rounded-lg bg-amber-50 px-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
            >
              검토할 초안 {needsReviewCount}개
            </Link>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">작업 상태</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <p className="text-2xl font-semibold tracking-tight text-amber-900">
                  {needsReviewCount}
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">저장 전 확인이 필요한 초안</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  {recentRecipes.length}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">최근 저장한 레시피</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-sm font-medium text-slate-400">다음 기능</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">재료별 상품 후보</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              가격 정보는 메인 작업을 방해하지 않도록 상세 화면에서 재료를 선택하는 흐름으로
              붙입니다.
            </p>
          </section>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">내 저장함</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              최근 저장한 레시피
            </h2>
          </div>
          <Link
            href="/recipes"
            className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            모두 보기
          </Link>
        </div>

        {recentRecipes.length > 0 ? (
          <RecommendationList recipes={recentRecipes} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-sm font-medium text-slate-700">아직 저장한 레시피가 없습니다.</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              위에 레시피 링크를 붙여넣고 첫 저장함을 만들어보세요.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
