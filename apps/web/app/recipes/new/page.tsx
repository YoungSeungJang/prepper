import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { RecipeForm } from "@/components/recipe-form";
import { StatusPanel } from "@/components/status-panel";
import { requireUser } from "@/lib/auth";
import { startRecipeImportAction } from "../actions";

type NewRecipePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

export default async function NewRecipePage({ searchParams }: NewRecipePageProps) {
  await requireUser("/recipes/new");
  const params = await searchParams;
  const error = getSearchParam(params, "error");
  const sourceUrl = getSearchParam(params, "sourceUrl");

  return (
    <AppShell>
      <PageHeading
        title="새 레시피 저장"
        description="링크를 붙여넣고 요리할 때 바로 볼 카드로 정리합니다."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <RecipeForm
          action={startRecipeImportAction}
          error={error}
          mode="new"
          sourceUrl={sourceUrl}
        />
        <div className="grid content-start gap-4">
          <StatusPanel title="지원 소스">
            YouTube와 일반 웹 레시피 링크를 먼저 지원합니다.
          </StatusPanel>
          <StatusPanel title="저장 전 확인">
            파싱 결과는 바로 저장하지 않고 확인 화면에서 수정합니다.
          </StatusPanel>
        </div>
      </div>
    </AppShell>
  );
}
