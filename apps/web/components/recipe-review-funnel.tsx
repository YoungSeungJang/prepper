"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveRecipeAction } from "@/app/recipes/actions";
import type { RecipeListItem } from "@/lib/recipes/types";

function sourceLabel(sourceType: string) {
  if (sourceType === "youtube") return "YouTube";
  return "블로그";
}

function getReviewModalCopy(recipe: RecipeListItem) {
  const hasIngredients = recipe.ingredients.length >= 2;
  const hasSteps = recipe.steps.length >= 2;

  if (recipe.sourceType === "youtube" && hasIngredients && !hasSteps) {
    return {
      eyebrow: "거의 완성됐어요",
      title: "재료는 찾았고, 조리 단계만 조금 보정하면 됩니다",
      description:
        "영상 설명이나 자막에서 단계가 충분하지 않았어요. 핵심 단계만 채우면 바로 요리 카드로 저장됩니다.",
    };
  }

  if (recipe.sourceType === "youtube" && !hasIngredients && !hasSteps) {
    return {
      eyebrow: "정보가 부족해요",
      title: "영상에서 카드에 필요한 텍스트를 충분히 찾지 못했어요",
      description:
        "제목과 원본은 저장했지만, 요리할 때 바로 보려면 재료와 조리순서를 단계별로 채워야 합니다.",
    };
  }

  if (!hasIngredients || !hasSteps) {
    return {
      eyebrow: "조금만 보정하면 됩니다",
      title: "부족한 항목만 채우면 카드가 완성됩니다",
      description:
        "찾은 내용은 미리 넣어뒀습니다. 단계별로 확인하고 필요한 항목만 채워주세요.",
    };
  }

  return {
    eyebrow: "확인 후 저장",
    title: "자동 정리된 카드 내용을 확인해 주세요",
    description: "제목을 원하는 이름으로 바꾸거나, 그대로 저장할 수 있습니다.",
  };
}

function withTrailingBlank(values: string[]) {
  return [...values.map((value) => value.trim()).filter(Boolean), ""];
}

function getInitialRows(values: string[], shouldUseParsedValues: boolean) {
  if (!shouldUseParsedValues) {
    return [""];
  }

  return withTrailingBlank(values);
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      style={{
        background: "var(--warm)",
        border: "none",
        borderRadius: 12,
        color: "#fff",
        cursor: pending ? "wait" : "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 800,
        height: 44,
        opacity: pending ? 0.72 : 1,
        padding: "0 18px",
      }}
    >
      {pending ? "저장 중" : "카드 저장"}
    </button>
  );
}

function StepPill({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        background: done ? "rgba(199,90,46,0.1)" : active ? "#fff8e1" : "#f5f5f7",
        border: active ? "1px solid #f1df9a" : "1px solid transparent",
        borderRadius: 12,
        color: done ? "var(--warm)" : "#424245",
        fontSize: 12,
        fontWeight: 800,
        padding: "9px 8px",
        textAlign: "center",
      }}
    >
      {done ? "✓ " : ""}
      {label}
    </div>
  );
}

function TextRowInput({
  index,
  onChange,
  placeholder,
  value,
}: {
  index: number;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div style={{ alignItems: "center", display: "grid", gap: 8, gridTemplateColumns: "30px minmax(0,1fr)" }}>
      <span style={{ color: "#86868b", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
        {index + 1}
      </span>
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
        style={{
          border: "1px solid #d8d8de",
          borderRadius: 12,
          fontFamily: "inherit",
          fontSize: 14,
          height: 42,
          padding: "0 12px",
        }}
      />
    </div>
  );
}

export function RecipeReviewFunnel({
  closeHref = "/",
  error,
  recipe,
}: {
  closeHref?: string;
  error?: string;
  recipe: RecipeListItem;
}) {
  const copy = getReviewModalCopy(recipe);
  const hasEnoughIngredients = recipe.ingredients.length >= 2;
  const hasEnoughSteps = recipe.steps.length >= 2;
  const parsedIngredients = recipe.ingredients.map((ingredient) => ingredient.rawText);
  const parsedSteps = recipe.steps;
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState(
    getInitialRows(parsedIngredients, hasEnoughIngredients),
  );
  const [steps, setSteps] = useState(getInitialRows(parsedSteps, hasEnoughSteps));
  const cleanedIngredients = ingredients.map((ingredient) => ingredient.trim()).filter(Boolean);
  const cleanedSteps = steps.map((recipeStep) => recipeStep.trim()).filter(Boolean);
  const effectiveTitle = title.trim() || recipe.title;
  const visibleStep = ["제목", "재료", "조리순서", "미리보기"][step];
  const progressPercent = Math.round(((step + 1) / 4) * 100);
  const canGoNext = step === 1 ? cleanedIngredients.length > 0 : step === 2 ? cleanedSteps.length > 0 : true;

  const setIngredient = (index: number, value: string) => {
    setIngredients((current) => withTrailingBlank(current.map((item, itemIndex) => (itemIndex === index ? value : item))));
  };
  const setRecipeStep = (index: number, value: string) => {
    setSteps((current) => withTrailingBlank(current.map((item, itemIndex) => (itemIndex === index ? value : item))));
  };

  return (
    <div
      style={{
        alignItems: "center",
        background: "rgba(29,29,31,0.42)",
        display: "flex",
        inset: 0,
        justifyContent: "center",
        padding: 24,
        position: "fixed",
        zIndex: 90,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.26)",
          maxHeight: "calc(100vh - 48px)",
          maxWidth: 760,
          overflowY: "auto",
          padding: 26,
          width: "100%",
        }}
      >
        <div style={{ alignItems: "flex-start", display: "flex", gap: 18, justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--warm)", fontSize: 13, fontWeight: 800, marginBottom: 7 }}>
              {copy.eyebrow}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 750, letterSpacing: "-0.035em", lineHeight: 1.16, margin: 0 }}>
              {copy.title}
            </h2>
            <p style={{ color: "#6e6e73", fontSize: 14, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 600 }}>
              {copy.description}
            </p>
          </div>
          <Link
            href={closeHref}
            style={{
              alignItems: "center",
              background: "#f5f5f7",
              borderRadius: 9999,
              color: "#6e6e73",
              display: "flex",
              flexShrink: 0,
              fontSize: 18,
              height: 34,
              justifyContent: "center",
              textDecoration: "none",
              width: 34,
            }}
          >
            ×
          </Link>
        </div>

        <div
          style={{
            background: "#f5f5f7",
            borderRadius: 14,
            color: "#424245",
            display: "flex",
            flexWrap: "wrap",
            fontSize: 13,
            gap: 8,
            marginTop: 18,
            padding: 12,
          }}
        >
          <span>{sourceLabel(recipe.sourceType)}</span>
          <span>·</span>
          <span>재료 {recipe.ingredients.length}개</span>
          <span>·</span>
          <span>단계 {recipe.steps.length}개</span>
        </div>

        {error ? (
          <p
            style={{
              background: "#fff0f0",
              border: "1px solid #ffd1d1",
              borderRadius: 10,
              color: "#b42318",
              fontSize: 13,
              fontWeight: 600,
              margin: "16px 0 0",
              padding: "10px 12px",
            }}
          >
            {error}
          </p>
        ) : null}

        {recipe.warnings?.length ? (
          <div
            style={{
              background: "#fff8e1",
              border: "1px solid #f1df9a",
              borderRadius: 12,
              color: "#7a5420",
              fontSize: 13,
              lineHeight: 1.55,
              marginTop: 14,
              padding: 12,
            }}
          >
            {recipe.warnings.slice(0, 2).map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        ) : null}

        <form action={saveRecipeAction} style={{ display: "grid", gap: 18, marginTop: 22 }}>
          <input name="recipeId" type="hidden" value={recipe.id} />
          <input name="sourceType" type="hidden" value={recipe.sourceType} />
          <input name="sourceUrl" type="hidden" value={recipe.sourceUrl} />
          <input name="servings" type="hidden" value={recipe.servings} />
          <input name="fallbackTitle" type="hidden" value={recipe.title} />
          <input name="title" type="hidden" value={title} />
          {cleanedIngredients.map((ingredient, index) => (
            <input key={`ingredient-${index}`} name="ingredients" type="hidden" value={ingredient} />
          ))}
          {cleanedSteps.map((recipeStep, index) => (
            <input key={`step-${index}`} name="steps" type="hidden" value={recipeStep} />
          ))}

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ alignItems: "center", display: "flex", gap: 10, justifyContent: "space-between" }}>
              <div style={{ color: "#424245", fontSize: 13, fontWeight: 800 }}>현재 단계: {visibleStep}</div>
              <div style={{ color: "#86868b", fontSize: 12, fontWeight: 700 }}>{step + 1}/4</div>
            </div>
            <div style={{ background: "#f0f0f2", borderRadius: 9999, height: 8, overflow: "hidden" }}>
              <div
                style={{
                  background: "var(--warm)",
                  borderRadius: 9999,
                  height: "100%",
                  transition: "width .18s ease",
                  width: `${progressPercent}%`,
                }}
              />
            </div>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
              {["제목", "재료", "조리순서", "미리보기"].map((label, index) => (
                <StepPill active={step === index} done={step > index} key={label} label={label} />
              ))}
            </div>
          </div>

          {step === 0 ? (
            <section style={{ border: "1px solid #ececef", borderRadius: 16, display: "grid", gap: 12, padding: 16 }}>
              <div>
                <div style={{ color: "#1d1d1f", fontSize: 15, fontWeight: 800 }}>카드 제목</div>
                <p style={{ color: "#86868b", fontSize: 13, lineHeight: 1.55, margin: "6px 0 0" }}>
                  비워두면 원본 링크에서 가져온 제목을 그대로 사용합니다.
                </p>
              </div>
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder={recipe.title}
                value={title}
                style={{
                  border: "1px solid #d8d8de",
                  borderRadius: 12,
                  fontFamily: "inherit",
                  fontSize: 15,
                  height: 48,
                  padding: "0 13px",
                }}
              />
            </section>
          ) : null}

          {step === 1 ? (
            <section style={{ border: hasEnoughIngredients ? "1px solid #ececef" : "1px solid #f1df9a", borderRadius: 16, display: "grid", gap: 12, padding: 16 }}>
              <div style={{ alignItems: "flex-start", display: "flex", gap: 12, justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#1d1d1f", fontSize: 15, fontWeight: 800 }}>재료</div>
                  <p style={{ color: "#86868b", fontSize: 13, lineHeight: 1.55, margin: "6px 0 0" }}>
                    {hasEnoughIngredients ? "재료는 충분히 찾았어요. 그대로 저장하거나 필요한 줄을 수정하세요." : "재료 정보를 충분히 찾지 못했어요. 한 줄에 하나씩 채워주세요."}
                  </p>
                </div>
	              <span style={{ background: hasEnoughIngredients ? "rgba(199,90,46,0.1)" : "#fff8e1", borderRadius: 9999, color: hasEnoughIngredients ? "var(--warm)" : "#7a5420", flexShrink: 0, fontSize: 12, fontWeight: 800, padding: "6px 10px" }}>
	                {hasEnoughIngredients ? "자동 입력됨" : "입력 필요"}
	              </span>
	            </div>
              {!hasEnoughIngredients && parsedIngredients.length > 0 ? (
                <div style={{ background: "#fff8e1", border: "1px solid #f1df9a", borderRadius: 12, color: "#7a5420", display: "grid", fontSize: 13, gap: 6, lineHeight: 1.5, padding: 12 }}>
                  <div style={{ fontWeight: 800 }}>참고로 찾은 재료 후보</div>
                  {parsedIngredients.map((ingredient) => (
                    <div key={`candidate-ingredient-${ingredient}`}>{ingredient}</div>
                  ))}
                </div>
              ) : null}
              <fieldset style={{ border: "none", display: "grid", gap: 10, margin: 0, padding: 0 }}>
                {ingredients.map((ingredient, index) => (
                  <TextRowInput
                    index={index}
                    key={`ingredient-input-${index}`}
                    onChange={(value) => setIngredient(index, value)}
                    placeholder="예: 양파 1/2개"
                    value={ingredient}
                  />
                ))}
              </fieldset>
              {cleanedIngredients.length === 0 ? (
                <div style={{ color: "#b42318", fontSize: 13, fontWeight: 700 }}>
                  재료를 최소 1개 입력해야 다음으로 넘어갈 수 있어요.
                </div>
              ) : null}
            </section>
          ) : null}

          {step === 2 ? (
            <section style={{ border: hasEnoughSteps ? "1px solid #ececef" : "1px solid #f1df9a", borderRadius: 16, display: "grid", gap: 12, padding: 16 }}>
              <div style={{ alignItems: "flex-start", display: "flex", gap: 12, justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#1d1d1f", fontSize: 15, fontWeight: 800 }}>조리순서</div>
                  <p style={{ color: "#86868b", fontSize: 13, lineHeight: 1.55, margin: "6px 0 0" }}>
                    {hasEnoughSteps ? "조리순서도 충분히 정리됐어요. 그대로 저장하거나 필요한 줄을 수정하세요." : "영상이나 원문에서 조리순서를 충분히 찾지 못했어요. 요리할 때 볼 순서만 채워주세요."}
                  </p>
                </div>
	              <span style={{ background: hasEnoughSteps ? "rgba(199,90,46,0.1)" : "#fff8e1", borderRadius: 9999, color: hasEnoughSteps ? "var(--warm)" : "#7a5420", flexShrink: 0, fontSize: 12, fontWeight: 800, padding: "6px 10px" }}>
	                {hasEnoughSteps ? "자동 입력됨" : "입력 필요"}
	              </span>
	            </div>
              {!hasEnoughSteps && parsedSteps.length > 0 ? (
                <div style={{ background: "#fff8e1", border: "1px solid #f1df9a", borderRadius: 12, color: "#7a5420", display: "grid", fontSize: 13, gap: 6, lineHeight: 1.5, padding: 12 }}>
                  <div style={{ fontWeight: 800 }}>참고로 찾은 조리순서 후보</div>
                  {parsedSteps.map((recipeStep, index) => (
                    <div key={`candidate-step-${recipeStep}`}>{index + 1}. {recipeStep}</div>
                  ))}
                </div>
              ) : null}
              <fieldset style={{ border: "none", display: "grid", gap: 10, margin: 0, padding: 0 }}>
                {steps.map((recipeStep, index) => (
                  <TextRowInput
                    index={index}
                    key={`step-input-${index}`}
                    onChange={(value) => setRecipeStep(index, value)}
                    placeholder="예: 팬에 기름을 두르고 양파를 먼저 볶기"
                    value={recipeStep}
                  />
                ))}
              </fieldset>
              {cleanedSteps.length === 0 ? (
                <div style={{ color: "#b42318", fontSize: 13, fontWeight: 700 }}>
                  조리순서를 최소 1개 입력해야 미리보기로 넘어갈 수 있어요.
                </div>
              ) : null}
            </section>
          ) : null}

          {step === 3 ? (
            <section style={{ border: "1px solid #ececef", borderRadius: 16, display: "grid", gap: 18, padding: 16 }}>
              <div>
                <div style={{ color: "#1d1d1f", fontSize: 15, fontWeight: 800 }}>완성된 카드 미리보기</div>
                <p style={{ color: "#86868b", fontSize: 13, lineHeight: 1.55, margin: "6px 0 0" }}>
                  저장하기 전에 제목, 재료, 조리순서를 마지막으로 확인해 주세요.
                </p>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ color: "#86868b", fontSize: 12, fontWeight: 800 }}>제목</div>
                <div style={{ background: "#f5f5f7", borderRadius: 12, color: "#1d1d1f", fontSize: 15, fontWeight: 800, lineHeight: 1.45, padding: 12 }}>
                  {effectiveTitle}
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ color: "#86868b", fontSize: 12, fontWeight: 800 }}>재료</div>
                <ul style={{ display: "grid", gap: 7, listStyle: "none", margin: 0, padding: 0 }}>
                  {cleanedIngredients.map((ingredient) => (
                    <li key={`preview-ingredient-${ingredient}`} style={{ background: "#f5f5f7", borderRadius: 10, color: "#424245", fontSize: 13, lineHeight: 1.45, padding: "9px 11px" }}>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ color: "#86868b", fontSize: 12, fontWeight: 800 }}>조리순서</div>
                <ol style={{ display: "grid", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
                  {cleanedSteps.map((recipeStep, index) => (
                    <li key={`preview-step-${recipeStep}`} style={{ alignItems: "flex-start", background: "#f5f5f7", borderRadius: 10, color: "#424245", display: "flex", fontSize: 13, gap: 9, lineHeight: 1.5, padding: "9px 11px" }}>
                      <span style={{ color: "#86868b", flexShrink: 0, fontWeight: 800 }}>{index + 1}</span>
                      <span>{recipeStep}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <a href={recipe.sourceUrl} style={{ color: "var(--warm)", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>
                원본 링크 보기
              </a>
            </section>
          ) : null}

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
            <div>
              {step > 0 ? (
                <button
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  type="button"
                  style={{
                    background: "#fff",
                    border: "1px solid #d8d8de",
                    borderRadius: 12,
                    color: "#424245",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 700,
                    height: 44,
                    padding: "0 16px",
                  }}
                >
                  이전
                </button>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href={closeHref}
                style={{
                  alignItems: "center",
                  border: "1px solid #d8d8de",
                  borderRadius: 12,
                  color: "#424245",
                  display: "inline-flex",
                  fontSize: 14,
                  fontWeight: 700,
                  height: 44,
                  padding: "0 16px",
                  textDecoration: "none",
                }}
              >
                나중에 완성하기
              </Link>
              {step < 3 ? (
                <button
                  disabled={!canGoNext}
                  onClick={() => setStep((current) => Math.min(3, current + 1))}
                  type="button"
                  style={{
                    background: "var(--warm)",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    cursor: canGoNext ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 800,
                    height: 44,
                    opacity: canGoNext ? 1 : 0.45,
                    padding: "0 18px",
                  }}
                >
                  다음
                </button>
              ) : (
                <SaveButton />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
