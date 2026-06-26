"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { deleteRecipeAction } from "@/app/recipes/actions";
import type { RecipeListItem } from "@/lib/recipes/types";

function gradientForSource(sourceType: string) {
  if (sourceType === "youtube") return "linear-gradient(135deg,#E9A86B,#D2772F)";
  return "linear-gradient(135deg,#A7C497,#6E9A5B)";
}

function sourceLabel(sourceType: string) {
  return sourceType === "youtube" ? "YouTube" : "블로그";
}

export function RecipeGridCard({
  isSelected = false,
  recipe,
}: {
  isSelected?: boolean;
  recipe: RecipeListItem;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const grad = gradientForSource(recipe.sourceType);
  const src = sourceLabel(recipe.sourceType);
  const href = recipe.status === "needs_review" ? `/?review=${recipe.id}` : `/?recipe=${recipe.id}`;

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div style={{ position: "relative" }}>
      <Link
        href={href}
        style={{
          border: isSelected ? "2px solid var(--warm)" : "1px solid #ececef",
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          textDecoration: "none",
          color: "inherit",
          display: "block",
          transition: "border-color .15s ease, transform .15s ease",
        }}
      >
        <div style={{ background: grad, height: 150, position: "relative" }}>
          <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "4px 8px" }}>
            {src}
          </span>
          {recipe.status === "needs_review" && (
            <span style={{ position: "absolute", bottom: 10, right: 10, background: "#febc2e", color: "#1d1d1f", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "4px 8px" }}>
              확인 필요
            </span>
          )}
        </div>
        <div style={{ padding: "14px 15px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 5, paddingRight: 28 }}>{recipe.title}</div>
          <div style={{ fontSize: 12.5, color: "#86868b" }}>재료 {recipe.ingredients.length}개 · {recipe.servings}</div>
        </div>
      </Link>

      <div ref={menuRef} style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
          style={{
            width: 28, height: 28,
            borderRadius: 8,
            border: "none",
            background: menuOpen ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.4)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            fontSize: 18,
            lineHeight: 1,
          }}
          aria-label="메뉴"
        >
          ···
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute", top: 34, right: 0,
            background: "#fff",
            border: "1px solid #e8e8ec",
            borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            minWidth: 120,
            overflow: "hidden",
          }}>
            <form action={deleteRecipeAction}>
              <input type="hidden" name="recipeId" value={recipe.id} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  color: "#ff3b30",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                삭제
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
