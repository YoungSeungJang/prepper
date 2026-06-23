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
        description="YouTube나 웹 레시피 링크를 붙여넣으면 자동으로 정리해 저장합니다. 정보가 부족할 때만 확인 화면으로 이동합니다."
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
            제목, 재료, 조리 순서가 충분하면 바로 저장합니다. 부족한 링크만 확인이 필요합니다.
          </StatusPanel>
          <StatusPanel title="지원 링크">
            YouTube, Shorts, 일반 웹 레시피를 먼저 지원합니다.
          </StatusPanel>
        </div>
      </div>
    </AppShell>
  );
}
