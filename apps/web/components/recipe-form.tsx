const sampleIngredients = "돼지고기 앞다리살 300g\n양파 1/2개\n고추장 1큰술";
const sampleSteps = "재료를 먹기 좋은 크기로 썬다.\n양념을 섞는다.\n팬에 넣고 볶는다.";

export function RecipeForm({ mode }: { mode: "new" | "review" }) {
  return (
    <form className="grid gap-5 rounded-2xl border border-[#eadccd] bg-[#fffaf3] p-5 shadow-[0_12px_36px_rgba(51,33,20,0.06)]">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="source-url">
          원본 링크
        </label>
        <input
          id="source-url"
          defaultValue={
            mode === "review" ? "https://www.youtube.com/watch?v=example-jeyuk" : ""
          }
          placeholder="https://..."
          className="h-12 rounded-lg border border-[#d8c8b8] bg-white px-3 text-sm outline-none focus:border-[#2f6f5e]"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          defaultValue={mode === "review" ? "제육볶음" : ""}
          placeholder="레시피 제목"
          className="h-12 rounded-lg border border-[#d8c8b8] bg-white px-3 text-sm outline-none focus:border-[#2f6f5e]"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="ingredients">
          재료
        </label>
        <textarea
          id="ingredients"
          defaultValue={mode === "review" ? sampleIngredients : ""}
          placeholder={sampleIngredients}
          rows={5}
          className="resize-none rounded-lg border border-[#d8c8b8] bg-white px-3 py-2 text-sm outline-none focus:border-[#2f6f5e]"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-neutral-800" htmlFor="steps">
          조리 순서
        </label>
        <textarea
          id="steps"
          defaultValue={mode === "review" ? sampleSteps : ""}
          placeholder={sampleSteps}
          rows={6}
          className="resize-none rounded-lg border border-[#d8c8b8] bg-white px-3 py-2 text-sm outline-none focus:border-[#2f6f5e]"
        />
      </div>
      <button
        type="button"
        className="h-12 rounded-full bg-[#2f6f5e] px-4 text-sm font-semibold text-white hover:bg-[#285f51]"
      >
        {mode === "review" ? "저장하기" : "레시피 만들기"}
      </button>
    </form>
  );
}
