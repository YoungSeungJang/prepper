"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function RecipeSearchControl({
  activeCategory,
  initialQuery,
}: {
  activeCategory: "saved" | "pending";
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const lastSyncedQuery = useRef(initialQuery);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed === lastSyncedQuery.current) {
      return;
    }

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (activeCategory === "pending") {
        params.set("category", "pending");
      } else {
        params.delete("category");
      }

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      lastSyncedQuery.current = trimmed;
      const nextPath = params.toString() ? `/?${params.toString()}` : "/";
      router.replace(nextPath, { scroll: false });
    }, 300);

    return () => window.clearTimeout(handle);
  }, [activeCategory, query, router, searchParams]);

  return (
    <div style={{ alignItems: "center", display: "flex", gap: 9, flex: 1, maxWidth: 420, background: "#f0f0f2", borderRadius: 9999, padding: "9px 16px" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: "#86868b", flexShrink: 0 }}>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        aria-label="레시피나 재료 검색"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="레시피나 재료 검색"
        value={query}
        style={{
          background: "transparent",
          border: "none",
          color: "#1d1d1f",
          flex: 1,
          fontFamily: "inherit",
          fontSize: 14,
          minWidth: 0,
          outline: "none",
        }}
      />
    </div>
  );
}
