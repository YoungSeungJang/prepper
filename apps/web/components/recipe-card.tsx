import Link from "next/link";
import { getRecipeHref } from "@/lib/recipe-status";
import type { RecipeListItem } from "@/lib/recipes/types";

function gradientForSource(sourceType: string) {
  if (sourceType === "youtube") return "linear-gradient(135deg,#E9A86B,#D2772F)";
  return "linear-gradient(135deg,#A7C497,#6E9A5B)";
}

export function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const src = recipe.sourceType === "youtube" ? "YouTube" : "블로그";
  const grad = gradientForSource(recipe.sourceType);

  return (
    <Link
      href={getRecipeHref(recipe)}
      style={{
        border: "1px solid #ececef",
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      <div style={{ background: grad, height: 150, position: "relative" }}>
        <span style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "4px 8px",
        }}>
          {src}
        </span>
        {recipe.status === "needs_review" && (
          <span style={{
            position: "absolute", top: 10, right: 10,
            background: "#febc2e", color: "#1d1d1f",
            fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "4px 8px",
          }}>
            확인 필요
          </span>
        )}
      </div>
      <div style={{ padding: "14px 15px 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 5 }}>
          {recipe.title}
        </div>
        <div style={{ fontSize: 12.5, color: "#86868b" }}>
          재료 {recipe.ingredients.length}개 · {recipe.servings}
        </div>
      </div>
    </Link>
  );
}
