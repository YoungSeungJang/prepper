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
        description="YouTube나 웹 레시피 링크를 붙여넣으면 저장 전 검토 초안을 만듭니다."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <RecipeForm
          action={startRecipeImportAction}
          error={error}
          mode="new"
          sourceUrl={sourceUrl}
        />
        <div className="grid content-start gap-4">
          <StatusPanel title="가져오기 흐름">
            링크를 분석한 뒤 바로 저장하지 않고 검토 화면에서 확인합니다.
          </StatusPanel>
          <StatusPanel title="지원 링크">
            YouTube, Shorts, 일반 웹 레시피를 먼저 지원합니다.
          </StatusPanel>
        </div>
      </div>
    </AppShell>
  );
}
