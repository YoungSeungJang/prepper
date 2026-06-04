import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeSearch } from "@/components/recipe-search";
import { requireUser } from "@/lib/auth";
import { mockRecipes } from "@/lib/mock-data";

export default async function RecipesPage() {
  await requireUser("/recipes");

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
      <div className="grid gap-3 md:grid-cols-2">
        {mockRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </AppShell>
  );
}
