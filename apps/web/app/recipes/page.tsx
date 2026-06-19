import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeSearch } from "@/components/recipe-search";
import { requireUser } from "@/lib/auth";
import { listSavedRecipes } from "@/lib/recipes/queries";

export default async function RecipesPage() {
  await requireUser("/recipes");
  const recipes = await listSavedRecipes();

  return (
    <AppShell>
      <PageHeading
        title="저장함"
        description="요리할 때 다시 열어볼 레시피를 모아둡니다."
        action={
          <Link
            href="/recipes/new"
            className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
          >
            추가
          </Link>
        }
      />
      <div className="mb-5">
        <RecipeSearch />
      </div>
      {recipes.length > 0 ? (
        <div className="grid gap-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm font-medium text-slate-500">
          아직 저장한 레시피가 없습니다. 먼저 레시피 링크를 추가해 주세요.
        </div>
      )}
    </AppShell>
  );
}
