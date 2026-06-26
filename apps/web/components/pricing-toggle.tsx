"use client";

import Link from "next/link";
import { useState } from "react";

const checkIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "var(--warm)" }}>
    <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function PricingToggle() {
  const [annual, setAnnual] = useState(false);

  const proPrice = annual ? "₩4,900" : "₩6,900";
  const period = annual ? "월 · 연간 결제" : "월";

  const toggleBase =
    "border-none rounded-full px-5 py-2.5 text-[15px] font-semibold cursor-pointer font-[inherit] transition-all flex items-center";
  const toggleOn = "bg-white text-[#1d1d1f] shadow-sm";
  const toggleOff = "bg-transparent text-[#6e6e73]";

  return (
    <section id="pricing" className="bg-[#f5f5f7] py-24 text-center px-6">
      <div className="max-w-[720px] mx-auto mb-9">
        <div className="text-[15px] font-semibold text-[var(--warm)] mb-4 tracking-[-0.01em]">요금제</div>
        <h2 className="text-[46px] font-bold leading-[1.1] tracking-[-0.03em] m-0 mb-4">부담 없이 시작하세요</h2>
        <p className="text-[19px] leading-relaxed text-[#6e6e73] m-0 tracking-[-0.01em]">
          레시피 50개까지는 언제나 무료. 더 필요해지면 그때 올리면 돼요.
        </p>
      </div>

      <div className="inline-flex items-center gap-1 bg-[#e8e8ec] rounded-full p-1 mb-12">
        <button
          type="button"
          onClick={() => setAnnual(false)}
          className={`${toggleBase} ${!annual ? toggleOn : toggleOff}`}
        >
          월간
        </button>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={`${toggleBase} ${annual ? toggleOn : toggleOff}`}
        >
          연간<span className="text-[var(--warm)] font-bold ml-1.5">−28%</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 max-w-[680px] mx-auto text-left">
        {/* Free */}
        <div className="bg-white border border-[#e6e6e9] rounded-[20px] p-8 flex flex-col">
          <div className="text-[19px] font-bold mb-1.5 tracking-[-0.02em]">무료</div>
          <div className="text-[14px] text-[#86868b] mb-6">가볍게 시작하는 분께</div>
          <div className="flex items-baseline gap-1 mb-7">
            <span className="text-[44px] font-bold tracking-[-0.03em]">₩0</span>
          </div>
          <Link
            href="/login?next=%2F%3FaddRecipe%3D1"
            className="text-center text-[16px] font-medium text-[#0066cc] bg-white border border-[#0066cc] rounded-full py-3 no-underline mb-7 transition hover:bg-[#f0f6ff]"
          >
            무료로 시작
          </Link>
          <div className="flex flex-col gap-3">
            {["레시피 50개 저장", "자동 파싱", "기본 태그 정리", "1개 기기"].map((item) => (
              <div key={item} className="flex gap-2.5 text-[15px] text-[#1d1d1f] items-center">
                {checkIcon}{item}
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div className="bg-white border-2 border-[#0066cc] rounded-[20px] p-8 flex flex-col relative shadow-[0_20px_50px_-20px_rgba(0,102,204,0.3)]">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0066cc] text-white text-xs font-semibold rounded-full px-3.5 py-1.5 whitespace-nowrap">
            가장 인기 있는
          </span>
          <div className="text-[19px] font-bold mb-1.5 tracking-[-0.02em]">프로</div>
          <div className="text-[14px] text-[#86868b] mb-6">진심으로 요리하는 분께</div>
          <div className="flex items-baseline gap-1 mb-7">
            <span className="text-[44px] font-bold tracking-[-0.03em]">{proPrice}</span>
            <span className="text-[15px] text-[#86868b]">/ {period}</span>
          </div>
          <Link
            href="/login?next=%2F%3FaddRecipe%3D1"
            className="text-center text-[16px] font-medium text-white bg-[#0066cc] rounded-full py-3 no-underline mb-7 transition hover:bg-[#0055aa]"
          >
            프로 시작하기
          </Link>
          <div className="flex flex-col gap-3">
            {[
              <><b className="font-semibold">무제한</b> 레시피 저장</>,
              "고급 파싱 · 영상 타임스탬프",
              "무제한 태그 · 폴더",
              "모든 기기 동기화 · 오프라인",
            ].map((item, i) => (
              <div key={i} className="flex gap-2.5 text-[15px] text-[#1d1d1f] items-center">
                {checkIcon}{item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
