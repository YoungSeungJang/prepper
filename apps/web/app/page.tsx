import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RecommendationList } from "@/components/recommendation-list";
import { StatusPanel } from "@/components/status-panel";
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
      <main className="min-h-screen bg-[#f6f4ef] text-slate-950">
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
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            레시피 정리하기
          </Link>
        </header>

        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-24 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:items-center">
          <div className="prepper-fade-up max-w-xl">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              Recipe link organizer
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl">
              레시피 링크를 요리용 노트로 바꿉니다.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              YouTube, Shorts, 블로그에 흩어진 레시피에서 재료와 조리 순서만 정리해
              저장하세요. 긴 원문은 남겨두고, 요리할 때 필요한 내용만 빠르게 봅니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login?next=%2F"
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                레시피 저장 시작하기
              </Link>
              <Link
                href="/login?next=%2Frecipes%2Fnew"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                링크 가져오기 보기
              </Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              실제 파싱과 저장은 로그인 후 진행됩니다.
            </p>
          </div>

          <div className="prepper-fade-up-delay-1 rounded-[28px] bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
            <div className="rounded-[24px] bg-[#f8fafc] p-4">
              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-slate-400">붙여넣은 링크</p>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-300">
                    YouTube Shorts
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 rounded-xl bg-white/[0.06] px-3 py-3 text-sm text-slate-200">
                    youtube.com/shorts/jeyuk-recipe
                  </div>
                  <div className="flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-slate-950">
                    초안 만들기
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">저장 전 확인 초안</p>
                    <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                      제육볶음
                    </h2>
                  </div>
                  <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                    확인 필요
                  </span>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">재료</p>
                    <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                      <li className="rounded-xl bg-slate-50 px-3 py-2">돼지고기 앞다리살 300g</li>
                      <li className="rounded-xl bg-slate-50 px-3 py-2">양파 1/2개</li>
                      <li className="rounded-xl bg-slate-50 px-3 py-2">고추장 1큰술</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">조리 순서</p>
                    <ol className="mt-2 grid gap-2 text-sm leading-6 text-slate-700">
                      <li>1. 재료를 먹기 좋은 크기로 썹니다.</li>
                      <li>2. 양념을 섞고 고기에 버무립니다.</li>
                      <li>3. 팬에서 충분히 볶아 마무리합니다.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="prepper-fade-up-delay-2 mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["1", "링크 붙여넣기", "유튜브, 쇼츠, 블로그 레시피 URL을 한 곳에 모읍니다."],
              ["2", "요리 정보 정리", "제목, 재료, 조리 순서 후보를 저장 전 초안으로 만듭니다."],
              ["3", "확인하고 저장", "애매한 내용은 확인 필요로 두고 직접 수정한 뒤 저장합니다."],
            ].map(([step, title, description]) => (
              <div key={step} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {step}
                </span>
                <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="prepper-fade-up-delay-2 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[32px] bg-slate-950 p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-9">
              <p className="text-sm font-medium text-slate-400">Why Prepper</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                저장한 레시피는 많은데, 다시 요리할 때마다 찾기 어렵습니다.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                링크 저장은 쉽지만 다시 요리할 때는 다릅니다. 영상은 다시 돌려봐야 하고,
                블로그는 긴 설명 사이에서 재료와 순서를 다시 찾아야 합니다.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                ["링크는 흩어지고", "유튜브, 쇼츠, 블로그, 메신저에 저장한 레시피가 제각각 남습니다."],
                ["다시 볼 때 오래 걸리고", "요리 중에는 원문 전체보다 재료와 순서만 빠르게 보고 싶습니다."],
                ["자동 정리는 확인이 필요합니다", "Prepper는 원문에 없는 내용을 확정하지 않고 검토 단계로 남깁니다."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                  <h3 className="text-base font-semibold tracking-tight text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="prepper-fade-up-delay-3">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-slate-500">What gets organized</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                원문은 그대로 두고, 요리할 때 필요한 내용만 정리합니다.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ["재료", "분량과 단위를 최대한 보존해 체크하기 쉬운 목록으로 정리합니다."],
                ["조리 순서", "긴 설명을 요리 흐름에 맞는 단계로 나눕니다."],
                ["원본 링크", "출처는 계속 남겨두어 필요할 때 원문으로 돌아갈 수 있습니다."],
                ["확인 필요", "정보가 부족하거나 애매한 항목은 저장 전 검토하도록 표시합니다."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                  <h3 className="text-base font-semibold tracking-tight text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-28 sm:px-8">
          <div className="prepper-fade-up-delay-3 rounded-[32px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 sm:p-9">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">Next</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  다음 가치는 재료에서 상품 정보로 이어집니다.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  레시피의 재료를 누르면 관련 상품 후보를 보고, 상품별 가격 변동을 확인하는
                  방향으로 확장합니다. 재료 하나에 가격을 억지로 붙이지 않고, 실제 상품 후보를
                  보여주는 방식입니다.
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-950 p-4 text-white">
                {[
                  ["양파", "국내산 햇양파 1.5kg", "최근 30일 가격 변동"],
                  ["돼지고기", "앞다리살 불고기용 500g", "상품 후보 비교"],
                  ["고추장", "태양초 고추장 1kg", "저장한 상품 추적"],
                ].map(([ingredient, product, note]) => (
                  <div key={ingredient} className="rounded-2xl bg-white/[0.06] p-4 not-last:mb-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{ingredient}</p>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-300">
                        {note}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{product}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
          <div className="prepper-fade-up-delay-3 rounded-[32px] bg-[#dbeafe] p-7 text-center shadow-sm sm:p-10">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              첫 레시피 링크부터 정리해보세요.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700">
              로그인 후 링크를 붙여넣으면 저장 전 확인 초안을 만들 수 있습니다.
            </p>
            <div className="mt-7 flex justify-center">
              <Link
                href="/login?next=%2Frecipes%2Fnew"
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
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
      <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-slate-500">Recipe import</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            레시피 링크를 저장하기 쉬운 형태로 정리하세요.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            YouTube, Shorts, 블로그 링크를 붙여넣으면 재료와 조리 순서를 추출하고,
            저장 전에 직접 확인할 수 있습니다.
          </p>
        </div>
        <form action={startRecipeImportAction} className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="sr-only" htmlFor="home-source-url">
            레시피 링크
          </label>
          <input name="nextPath" type="hidden" value="/recipes/new" />
          <input
            id="home-source-url"
            name="sourceUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-12 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            className="h-12 rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-700"
          >
            레시피 정리하기
          </button>
        </form>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <StatusPanel title="검토 필요한 초안">
          저장 전 확인이 필요한 레시피가 {needsReviewCount}개 있습니다.
        </StatusPanel>
        <StatusPanel title="가격 정보">
          다음 단계에서 재료별 상품 후보와 상품별 가격 변동을 연결합니다.
        </StatusPanel>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">
            최근 저장한 레시피
          </h2>
          <Link href="/recipes" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            모두 보기
          </Link>
        </div>
        <RecommendationList recipes={recentRecipes} />
      </section>
    </AppShell>
  );
}
