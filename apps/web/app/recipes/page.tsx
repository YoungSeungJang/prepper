import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeSearch } from "@/components/recipe-search";
import { requireUser } from "@/lib/auth";
import { listRecipes } from "@/lib/recipes/queries";

export default async function RecipesPage() {
  await requireUser("/recipes");
  const recipes = await listRecipes();

  return (
    <AppShell>
      <PageHeading
        title="저장함"
        description="요리할 때 다시 열어볼 레시피를 모아둡니다."
        action={
          <Link
            href="/recipes/new"
            className="inline-flex h-11 items-center rounded-full bg-[#276f5f] px-5 text-sm font-bold text-white hover:bg-[#1f5b4f]"
          >
            추가
          </Link>
        }
      />
      <div className="mb-5">
        <RecipeSearch />
      </div>
      {recipes.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#cfc6bb] bg-[#fffdfa] p-6 text-sm font-semibold text-[#625c54]">
          아직 저장한 레시피가 없습니다. 먼저 레시피 링크를 추가해 주세요.
        </div>
      )}
    </AppShell>
  );
}
