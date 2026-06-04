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
        className="h-11 min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
      />
      <button
        type="submit"
        className="h-11 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800"
      >
        검색
      </button>
    </form>
  );
}
