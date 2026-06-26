"use client";

import { useRouter } from "next/navigation";

export function RecipeSortControl({
  activeCategory,
  searchQuery,
  sort,
}: {
  activeCategory: "saved" | "pending";
  searchQuery: string;
  sort: "newest" | "oldest" | "title";
}) {
  const router = useRouter();

  return (
    <label style={{ alignItems: "center", color: "#86868b", display: "inline-flex", fontSize: 13, fontWeight: 700, gap: 8 }}>
      정렬
      <select
        aria-label="레시피 정렬"
        onChange={(event) => {
          const params = new URLSearchParams();
          if (activeCategory === "pending") {
            params.set("category", "pending");
          }
          if (searchQuery.trim()) {
            params.set("q", searchQuery.trim());
          }
          if (event.target.value !== "newest") {
            params.set("sort", event.target.value);
          }

          router.replace(params.toString() ? `/?${params.toString()}` : "/", { scroll: false });
        }}
        value={sort}
        style={{
          appearance: "none",
          background: "#f5f5f7",
          border: "1px solid #e1e1e6",
          borderRadius: 10,
          color: "#1d1d1f",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 700,
          height: 38,
          padding: "0 34px 0 12px",
        }}
      >
        <option value="newest">최신순</option>
        <option value="oldest">오래된순</option>
        <option value="title">이름순</option>
      </select>
    </label>
  );
}
