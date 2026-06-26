"use client";

import type { CSSProperties, ReactNode } from "react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  startRecipeImportFromModalAction,
  type RecipeImportFormState,
} from "@/app/recipes/actions";

const initialState: RecipeImportFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      style={{
        background: "var(--warm)",
        border: "none",
        borderRadius: 13,
        color: "#fff",
        cursor: pending ? "wait" : "pointer",
        fontFamily: "inherit",
        fontSize: 15,
        fontWeight: 700,
        height: 50,
        opacity: pending ? 0.72 : 1,
      }}
      type="submit"
    >
      {pending ? "레시피를 읽는 중" : "레시피 카드 만들기"}
    </button>
  );
}

function ImportProgress() {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      style={{
        background: "#f5f5f7",
        border: "1px solid #e5e5ea",
        borderRadius: 14,
        display: "grid",
        gap: 12,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <span
          style={{
            animation: "prepper-spin 0.9s linear infinite",
            border: "2px solid #e5e5ea",
            borderTopColor: "var(--warm)",
            borderRadius: "50%",
            flexShrink: 0,
            height: 18,
            marginTop: 2,
            width: 18,
          }}
        />
        <div>
          <div style={{ color: "#1d1d1f", fontSize: 14, fontWeight: 700 }}>
            링크를 분석하고 있어요
          </div>
          <div style={{ color: "#6e6e73", fontSize: 13, lineHeight: 1.5, marginTop: 3 }}>
            설명란, 자막, 본문에서 재료와 조리 단계를 찾는 중입니다.
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 7 }}>
        {["원본 링크 읽기", "재료 후보 찾기", "조리 단계 정리하기"].map((label) => (
          <div
            key={label}
            style={{ alignItems: "center", color: "#86868b", display: "flex", fontSize: 12.5, gap: 8 }}
          >
            <span
              style={{
                background: "var(--warm)",
                borderRadius: "50%",
                height: 6,
                opacity: 0.75,
                width: 6,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceUrlInput({ defaultValue }: { defaultValue?: string }) {
  const { pending } = useFormStatus();

  return (
    <input
      autoFocus
      defaultValue={defaultValue ?? ""}
      disabled={pending}
      id="modal-source-url"
      name="sourceUrl"
      placeholder="https://www.youtube.com/watch?v=..."
      style={{
        background: pending ? "#f5f5f7" : "#fff",
        border: "1px solid #d8d8de",
        borderRadius: 13,
        color: "#1d1d1f",
        fontFamily: "inherit",
        fontSize: 15,
        height: 50,
        outline: "none",
        padding: "0 14px",
      }}
    />
  );
}

function AddRecipeDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useActionState(
    startRecipeImportFromModalAction,
    initialState,
  );

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
        zIndex: 80,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 24px 80px rgba(0,0,0,0.26)",
          maxWidth: 520,
          padding: 24,
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            gap: 16,
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--warm)",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 7,
              }}
            >
              링크 추가
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              레시피 링크를 붙여넣으세요
            </h2>
            <p
              style={{
                color: "#6e6e73",
                fontSize: 14,
                lineHeight: 1.55,
                margin: "10px 0 0",
              }}
            >
              YouTube, Shorts, 블로그 링크를 읽어 레시피 카드로 정리합니다.
            </p>
          </div>
          <button
            aria-label="닫기"
            onClick={onClose}
            style={{
              alignItems: "center",
              background: "#f5f5f7",
              border: "none",
              borderRadius: 9999,
              color: "#6e6e73",
              cursor: "pointer",
              display: "flex",
              fontFamily: "inherit",
              fontSize: 18,
              height: 34,
              justifyContent: "center",
              width: 34,
            }}
            type="button"
          >
            ×
          </button>
        </div>

        {state.error ? (
          <p
            style={{
              background: "#fff0f0",
              border: "1px solid #ffd1d1",
              borderRadius: 10,
              color: "#b42318",
              fontSize: 13,
              fontWeight: 600,
              margin: "18px 0 0",
              padding: "10px 12px",
            }}
          >
            {state.error}
          </p>
        ) : null}

        <form action={formAction} style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <input name="nextPath" type="hidden" value="/" />
          <label
            htmlFor="modal-source-url"
            style={{ color: "#1d1d1f", fontSize: 13, fontWeight: 600 }}
          >
            레시피 URL
          </label>
          <SourceUrlInput defaultValue={state.sourceUrl} />
          <ImportProgress />
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

export function AddRecipeControl({
  buttonClassName,
  buttonStyle,
  children,
}: {
  buttonClassName?: string;
  buttonStyle?: CSSProperties;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);

  function closeDialog() {
    setIsOpen(false);
    setDialogKey((key) => key + 1);
  }

  return (
    <>
      <button
        className={buttonClassName}
        onClick={() => setIsOpen(true)}
        style={buttonStyle}
        type="button"
      >
        {children}
      </button>
      {isOpen ? <AddRecipeDialog key={dialogKey} onClose={closeDialog} /> : null}
    </>
  );
}
