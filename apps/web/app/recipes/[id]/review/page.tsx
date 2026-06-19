import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { RecipeForm } from "@/components/recipe-form";
import { StatusPanel } from "@/components/status-panel";
import { requireUser } from "@/lib/auth";
import { getRecipeById } from "@/lib/mock-data";
import { getRecipe } from "@/lib/recipes/queries";
import { saveRecipeAction } from "../../actions";

export default async function ReviewRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  await requireUser(`/recipes/${id}/review`);

  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : "";
  const recipe = (await getRecipe(id)) ?? getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeading
        title="저장 전 확인"
        description="자동으로 가져온 초안을 확인하고 필요한 부분만 수정합니다."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <RecipeForm
          action={saveRecipeAction}
          error={error}
          mode="review"
          recipeId={recipe.id}
          servings={recipe.servings}
          sourceType={recipe.sourceType}
          sourceUrl={recipe.sourceUrl}
          steps={recipe.steps}
          title={recipe.title}
          ingredients={recipe.ingredients}
        />
        <div className="grid content-start gap-4">
          <StatusPanel title="분석 상태">
            저장하기 전 제목, 재료, 조리 순서가 원문과 맞는지 확인해 주세요.
          </StatusPanel>
          {recipe.warnings?.length ? (
            <StatusPanel title="확인 필요">
              <ul className="grid gap-2">
                {recipe.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </StatusPanel>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
