export function RecipeSearch() {
  return (
    <form className="flex w-full gap-2">
      <label className="sr-only" htmlFor="recipe-search">
        레시피 검색
      </label>
      <input
        id="recipe-search"
        name="q"
        placeholder="레시피 이름 검색"
        className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
      />
      <button
        type="submit"
        className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
      >
        검색
      </button>
    </form>
  );
}
