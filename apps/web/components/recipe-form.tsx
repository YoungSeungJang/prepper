const sampleIngredients = "돼지고기 앞다리살 300g\n양파 1/2개\n고추장 1큰술";
const sampleSteps = "재료를 먹기 좋은 크기로 썬다.\n양념을 섞는다.\n팬에 넣고 볶는다.";
const emptyIngredientRows = 2;
const emptyStepRows = 2;

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
  const ingredientRows = [
    ...(ingredients?.map((ingredient) => ingredient.rawText) ?? []),
    ...Array.from({ length: mode === "review" ? emptyIngredientRows : 0 }, () => ""),
  ];
  const stepRows = [
    ...(steps ?? []),
    ...Array.from({ length: mode === "review" ? emptyStepRows : 0 }, () => ""),
  ];

  return (
    <form
      action={action}
      className="grid gap-5 rounded-lg border border-[#ded4c6] bg-white p-5 shadow-sm"
    >
      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {error}
        </p>
      ) : null}
      {recipeId ? <input name="recipeId" type="hidden" value={recipeId} /> : null}
      <input name="sourceType" type="hidden" value={sourceType} />
      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4d463d]" htmlFor="source-url">
          원본 링크
        </label>
        <input
          id="source-url"
          name="sourceUrl"
          defaultValue={sourceUrl ?? ""}
          placeholder="https://..."
          className="h-11 rounded-md border border-[#ded4c6] bg-white px-3 text-sm text-[#1f1b16] outline-none focus:border-[#82735f]"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4d463d]" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title ?? ""}
          placeholder="레시피 제목"
          className="h-11 rounded-md border border-[#ded4c6] bg-white px-3 text-sm text-[#1f1b16] outline-none focus:border-[#82735f]"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#4d463d]" htmlFor="servings">
          인분
        </label>
        <input
          id="servings"
          name="servings"
          defaultValue={servings ?? ""}
          placeholder="2인분"
          className="h-11 rounded-md border border-[#ded4c6] bg-white px-3 text-sm text-[#1f1b16] outline-none focus:border-[#82735f]"
        />
      </div>
      {mode === "review" ? (
        <>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium text-[#4d463d]">재료</legend>
            <div className="grid gap-2">
              {ingredientRows.map((rawText, index) => (
                <div
                  className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-2"
                  key={`ingredient-${index}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f7f1e8] text-xs font-medium text-[#7b6f61]">
                    {index + 1}
                  </span>
                  <input
                    name="ingredients"
                    defaultValue={rawText}
                    placeholder={index >= (ingredients?.length ?? 0) ? "재료 추가" : ""}
                    className="h-10 rounded-md border border-[#ded4c6] bg-white px-3 text-sm text-[#1f1b16] outline-none focus:border-[#82735f]"
                  />
                </div>
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium text-[#4d463d]">조리 순서</legend>
            <div className="grid gap-2">
              {stepRows.map((body, index) => (
                <div
                  className="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-2"
                  key={`step-${index}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f7f1e8] text-xs font-medium text-[#7b6f61]">
                    {index + 1}
                  </span>
                  <input
                    name="steps"
                    defaultValue={body}
                    placeholder={index >= (steps?.length ?? 0) ? "순서 추가" : ""}
                    className="h-10 rounded-md border border-[#ded4c6] bg-white px-3 text-sm text-[#1f1b16] outline-none focus:border-[#82735f]"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#4d463d]" htmlFor="ingredients">
              재료
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              defaultValue={ingredientText}
              placeholder={sampleIngredients}
              rows={5}
              className="resize-none rounded-md border border-[#ded4c6] bg-white px-3 py-2 text-sm leading-6 text-[#1f1b16] outline-none focus:border-[#82735f]"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[#4d463d]" htmlFor="steps">
              조리 순서
            </label>
            <textarea
              id="steps"
              name="steps"
              defaultValue={stepText}
              placeholder={sampleSteps}
              rows={6}
              className="resize-none rounded-md border border-[#ded4c6] bg-white px-3 py-2 text-sm leading-6 text-[#1f1b16] outline-none focus:border-[#82735f]"
            />
          </div>
        </>
      )}
      <button
        type="submit"
        className="h-11 rounded-md bg-[#2f3a2f] px-4 text-sm font-medium text-white hover:bg-[#253025]"
      >
        {mode === "review" ? "이대로 저장" : "레시피 만들기"}
      </button>
    </form>
  );
}
