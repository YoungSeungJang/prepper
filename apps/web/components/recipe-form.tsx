const sampleIngredients = "돼지고기 앞다리살 300g\n양파 1/2개\n고추장 1큰술";
const sampleSteps = "재료를 먹기 좋은 크기로 썬다.\n양념을 섞는다.\n팬에 넣고 볶는다.";

export function RecipeForm({
  action,
  error,
  mode,
  recipeId,
  servings,
  sourceUrl,
  sourceType = "web",
  steps,
  title,
  ingredients,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  error?: string;
  mode: "new" | "review";
  recipeId?: string;
  servings?: string;
  sourceUrl?: string;
  sourceType?: "youtube" | "web";
  steps?: string[];
  title?: string;
  ingredients?: Array<{ rawText: string }>;
}) {
  const ingredientText = ingredients?.map((ingredient) => ingredient.rawText).join("\n") ?? "";
  const stepText = steps?.join("\n") ?? "";

  return (
    <form
      action={action}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5"
    >
      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      ) : null}
      {recipeId ? <input name="recipeId" type="hidden" value={recipeId} /> : null}
      <input name="sourceType" type="hidden" value={sourceType} />
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="source-url">
          원본 링크
        </label>
        <input
          id="source-url"
          name="sourceUrl"
          defaultValue={sourceUrl ?? ""}
          placeholder="https://..."
          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title ?? ""}
          placeholder="레시피 제목"
          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="servings">
          인분
        </label>
        <input
          id="servings"
          name="servings"
          defaultValue={servings ?? ""}
          placeholder="2인분"
          className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="ingredients">
          재료
        </label>
        <textarea
          id="ingredients"
          name="ingredients"
          defaultValue={ingredientText}
          placeholder={sampleIngredients}
          rows={5}
          className="resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-slate-400"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="steps">
          조리 순서
        </label>
        <textarea
          id="steps"
          name="steps"
          defaultValue={stepText}
          placeholder={sampleSteps}
          rows={6}
          className="resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-slate-400"
        />
      </div>
      <button
        type="submit"
        className="h-11 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
      >
        {mode === "review" ? "저장하기" : "레시피 만들기"}
      </button>
    </form>
  );
}
