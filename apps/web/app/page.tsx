import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { AddRecipeControl } from "@/components/add-recipe-control";
import { PricingToggle } from "@/components/pricing-toggle";
import { RecipeGridCard } from "@/components/recipe-grid-card";
import { RecipeReviewFunnel } from "@/components/recipe-review-funnel";
import { getCurrentUser } from "@/lib/auth";
import {
  countReviewDrafts,
  listReviewDrafts,
  listSavedRecipes,
} from "@/lib/recipes/queries";
import type { RecipeListItem } from "@/lib/recipes/types";

/* ─── shared icon ─── */
function BookmarkIcon({ size = 15, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 3.5h12a1 1 0 0 1 1 1V20l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" fill={color} />
    </svg>
  );
}

/* ─── gradient per source type ─── */
function gradientForSource(sourceType: string) {
  if (sourceType === "youtube") return "linear-gradient(135deg,#E9A86B,#D2772F)";
  return "linear-gradient(135deg,#A7C497,#6E9A5B)";
}

function sourceLabel(sourceType: string) {
  if (sourceType === "youtube") return "YouTube";
  return "블로그";
}

/* ══════════════════════════════════════════════════════════
   LOGGED-OUT LANDING PAGE
══════════════════════════════════════════════════════════ */
function LandingPage() {
  return (
    <div style={{ background: "#ffffff", color: "#1d1d1f", width: "100%", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, height: 54,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(245,245,247,0.82)", backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ width: "100%", maxWidth: 1080, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "#1d1d1f" }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookmarkIcon />
            </span>
            <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>Prepper</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            {["기능", "후기", "가격"].map((label, i) => (
              <a key={label} href={`#${["features", "reviews", "pricing"][i]}`}
                style={{ fontSize: 14, color: "#1d1d1f", textDecoration: "none", letterSpacing: "-0.01em" }}>
                {label}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/login" style={{ fontSize: 14, color: "#1d1d1f", textDecoration: "none", letterSpacing: "-0.01em" }}>
              로그인
            </Link>
            <Link href="/login"
              style={{ fontSize: 14, fontWeight: 500, color: "#fff", background: "#0066cc", borderRadius: 9999, padding: "8px 16px", textDecoration: "none", letterSpacing: "-0.01em" }}>
              무료로 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "#f5f5f7", padding: "96px 24px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 9999, padding: "7px 15px", marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warm)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.01em" }}>베타 오픈 · 레시피 링크 정리의 새로운 방법</span>
          </div>
          <h1 style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.035em", margin: "0 0 26px", color: "#1d1d1f" }}>
            저장만 하던 레시피,<br />이제 <span style={{ color: "var(--warm)" }}>요리가 됩니다.</span>
          </h1>
          <p style={{ fontSize: 21, lineHeight: 1.5, color: "#6e6e73", maxWidth: 620, margin: "0 auto 38px", letterSpacing: "-0.01em" }}>
            유튜브와 블로그 링크는 붙여넣기만 하면 재료와 조리법이 자동으로 정리돼요. 자동 정리가 어려운 인스타그램은 직접 입력해 똑같은 카드로 깔끔하게 모을 수 있어요.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 9999, padding: "7px 7px 7px 20px", maxWidth: 520, margin: "0 auto 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "#86868b" }}>
              <path d="M9 15l6-6M10.5 6.5l1-1a4 4 0 0 1 5.7 5.7l-2 2M13.5 17.5l-1 1a4 4 0 0 1-5.7-5.7l2-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span style={{ flex: 1, textAlign: "left", fontSize: 16, color: "#86868b", letterSpacing: "-0.01em", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              https://youtube.com/watch?v=recipe...
            </span>
            <Link href="/login"
              style={{ background: "#0066cc", color: "#fff", borderRadius: 9999, padding: "11px 20px", fontSize: 15, fontWeight: 500, textDecoration: "none", flexShrink: 0, letterSpacing: "-0.01em", display: "inline-flex", alignItems: "center" }}>
              정리하기
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#86868b", margin: "0 0 56px", letterSpacing: "-0.01em" }}>신용카드 없이 무료로 시작 · 레시피 50개까지 평생 무료</p>
        </div>

        {/* App mockup */}
        <div style={{ maxWidth: 980, margin: "0 auto", paddingBottom: 0, transform: "translateY(40px)" }}>
          <div style={{ borderRadius: "16px 16px 0 0", overflow: "hidden", background: "#fff", boxShadow: "0 40px 80px -24px rgba(0,0,0,0.28), 0 10px 24px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", borderBottom: "none", textAlign: "left" }}>
            {/* titlebar */}
            <div style={{ height: 44, background: "#fbfbfd", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
              ))}
              <div style={{ marginLeft: 18, display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid #ececec", borderRadius: 8, padding: "5px 12px", minWidth: 280 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ color: "#b0b0b5" }}>
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 12, color: "#b0b0b5" }}>레시피 검색</span>
              </div>
            </div>
            <div style={{ display: "flex", minHeight: 420 }}>
              {/* sidebar */}
              <div style={{ width: 218, background: "#f5f5f7", borderRight: "1px solid #ececec", padding: "18px 12px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 16px" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookmarkIcon size={12} /></span>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>Prepper</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", padding: "4px 8px", letterSpacing: "0.02em" }}>컬렉션</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 8px", borderRadius: 7, background: "rgba(199,90,46,0.1)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warm)" }}>전체 레시피</span>
                  <span style={{ fontSize: 12, color: "var(--warm)" }}>48</span>
                </div>
                {[["한식", 14], ["비건 · 샐러드", 9], ["디저트 · 베이킹", 11], ["주말 브런치", 7], ["즐겨찾기", 7]].map(([label, count]) => (
                  <div key={label as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 8px" }}>
                    <span style={{ fontSize: 13, color: "#1d1d1f" }}>{label}</span>
                    <span style={{ fontSize: 12, color: "#b0b0b5" }}>{count}</span>
                  </div>
                ))}
              </div>
              {/* main */}
              <div style={{ flex: 1, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>전체 레시피 <span style={{ color: "#b0b0b5", fontWeight: 500 }}>48</span></h3>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#1d1d1f", background: "#f0f0f2", borderRadius: 9999, padding: "5px 11px" }}>전체</span>
                    <span style={{ fontSize: 12, color: "#6e6e73", padding: "5px 11px" }}>30분 이내</span>
                    <span style={{ fontSize: 12, color: "#6e6e73", padding: "5px 11px" }}>최근 저장</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                  {[
                    { title: "간장 마늘 닭볶음", src: "YouTube", grad: ["#E9A86B", "#D2772F"], meta: "재료 9 · 35분" },
                    { title: "아보카도 포케볼", src: "Instagram", grad: ["#A7C497", "#6E9A5B"], meta: "재료 11 · 20분" },
                    { title: "딸기 생크림 케이크", src: "블로그", grad: ["#E7C6D6", "#C98AA6"], meta: "재료 8 · 90분" },
                    { title: "감바스 알 아히요", src: "YouTube", grad: ["#E5B7A0", "#C46B4E"], meta: "재료 7 · 15분" },
                    { title: "바질 페스토 파스타", src: "만개의레시피", grad: ["#F0D79A", "#D9A93F"], meta: "재료 6 · 25분" },
                    { title: "버터 갈릭 스테이크", src: "Instagram", grad: ["#C9BBA8", "#9A8369"], meta: "재료 10 · 30분" },
                  ].map((card) => (
                    <div key={card.title} style={{ border: "1px solid #ececec", borderRadius: 11, overflow: "hidden", background: "#fff" }}>
                      <div style={{ height: 96, background: `linear-gradient(135deg,${card.grad[0]},${card.grad[1]})`, position: "relative" }}>
                        <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, fontWeight: 600, borderRadius: 5, padding: "3px 6px" }}>{card.src}</span>
                      </div>
                      <div style={{ padding: "10px 11px 12px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 5 }}>{card.title}</div>
                        <div style={{ fontSize: 11, color: "#86868b" }}>{card.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOURCE STRIP ── */}
      <section style={{ background: "#fff", padding: "80px 24px 56px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#86868b", margin: "0 0 28px", letterSpacing: "-0.01em" }}>유튜브와 블로그는 붙여넣기만 하면 자동으로 정리돼요</p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "14px 40px", maxWidth: 760, margin: "0 auto" }}>
          {["YouTube", "네이버 블로그", "만개의레시피", "티스토리", "브런치"].map((s) => (
            <span key={s} style={{ fontSize: 19, fontWeight: 700, color: "#c4c4c9", letterSpacing: "-0.02em" }}>{s}</span>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "#b0b0b5", margin: "26px auto 0", maxWidth: 580, lineHeight: 1.5, letterSpacing: "-0.01em" }}>
          인스타그램처럼 자동 정리가 어려운 출처는 <span style={{ color: "var(--warm)", fontWeight: 600 }}>직접 입력</span>으로 똑같은 레시피 카드에 정리할 수 있어요
        </p>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: "#fff", padding: "48px 24px 100px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto 64px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--warm)", marginBottom: 16, letterSpacing: "-0.01em" }}>왜 Prepper인가요</div>
          <h2 style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 18px" }}>필요한 건 전부<br />알아서 정리돼요</h2>
          <p style={{ fontSize: 19, lineHeight: 1.5, color: "#6e6e73", margin: 0, letterSpacing: "-0.01em" }}>
            스크랩 버튼만 누르고 다시 안 보던 레시피들. Prepper는 링크 속 정보를 읽어 한눈에 요리할 수 있게 바꿔 줍니다.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 1080, margin: "0 auto", textAlign: "left" }}>
          {[
            {
              icon: <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
              title: "유튜브·블로그 자동 정리",
              desc: "유튜브와 블로그 링크는 붙여넣기만 하면 재료·조리 순서·시간까지 자동으로 추출해요. 영상은 타임스탬프까지 잡아 줍니다.",
            },
            {
              icon: <><path d="M4 20l1-4.2L16.5 4.3a1.8 1.8 0 0 1 2.6 0l0.6 0.6a1.8 1.8 0 0 1 0 2.6L8.2 19 4 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14.5 6.5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
              title: "직접 추가도 간편하게",
              desc: "인스타그램처럼 자동 정리가 어려운 레시피는 재료와 순서를 직접 입력해, 자동 정리한 레시피와 똑같은 카드로 모을 수 있어요.",
            },
            {
              icon: <><path d="M4 9a8 8 0 0 1 13.5-3.5L20 8M20 15a8 8 0 0 1-13.5 3.5L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 4v4h-4M4 20v-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
              title: "어디서든 동기화",
              desc: "폰에서 저장하고 주방 태블릿에서 펼쳐 보세요. 오프라인에서도 조리법이 그대로 떠 있어요.",
            },
          ].map((feat) => (
            <div key={feat.title} style={{ background: "#f5f5f7", borderRadius: 18, padding: 32 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: "var(--warm)" }}>{feat.icon}</svg>
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{feat.title}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "#6e6e73", margin: 0, letterSpacing: "-0.01em" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARSING DETAIL ── */}
      <section style={{ background: "#f5f5f7", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--warm)", marginBottom: 16, letterSpacing: "-0.01em" }}>붙여넣기 한 번이면</div>
            <h2 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.03em", margin: "0 0 20px" }}>링크가 레시피가<br />되는 과정</h2>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "#6e6e73", margin: "0 0 28px", letterSpacing: "-0.01em" }}>
              유튜브·블로그는 주소만 붙여넣으면 끝이에요. 자동 정리가 어려운 출처는 재료와 순서를 직접 입력해 똑같은 레시피 카드로 만들 수 있어요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                ["링크를 붙여넣어요", "유튜브·블로그는 자동 추출, 그 외엔 직접 입력"],
                ["재료와 순서를 추출해요", "분량·소요 시간·조리 단계까지"],
                ["카드로 저장돼요", "태그를 달아 컬렉션에 정리"],
              ].map(([title, desc], i) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--warm)", color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 15, color: "#86868b", letterSpacing: "-0.01em" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Recipe card mockup */}
          <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 30px 60px -24px rgba(0,0,0,0.22), 0 6px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ height: 170, background: "linear-gradient(135deg,#E9A86B,#D2772F)", position: "relative" }}>
              <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "5px 9px" }}>YouTube · 3:42</span>
            </div>
            <div style={{ padding: 22 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>간장 마늘 닭볶음</h3>
              <p style={{ fontSize: 14, color: "#86868b", margin: "0 0 18px" }}>재료 9개 · 35분 · 2인분</p>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 10 }}>재료</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
                {["닭다리살 400g", "간장 3큰술", "다진 마늘 1큰술", "대파", "+5"].map((item) => (
                  <span key={item} style={{ fontSize: 13, background: "#f5f5f7", borderRadius: 9999, padding: "6px 12px", color: item === "+5" ? "#86868b" : "#1d1d1f" }}>{item}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {["#한식", "#매콤", "#저녁"].map((tag) => (
                  <span key={tag} style={{ fontSize: 12, fontWeight: 600, color: "var(--warm)", background: "var(--warm-soft)", borderRadius: 9999, padding: "5px 11px" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" style={{ background: "#fff", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto 56px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--warm)", marginBottom: 16, letterSpacing: "-0.01em" }}>사용자 후기</div>
          <h2 style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0 }}>다시 요리하게 됐다는<br />이야기들</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, maxWidth: 920, margin: "0 auto", textAlign: "left" }}>
          {[
            { quote: "\"스크랩만 해두고 다시 안 보던 레시피가 수백 개였는데, Prepper에 넣으니까 진짜 요리하게 됐어요.\"", name: "김서연", sub: "자취 4년차", color: "#D2772F", abbr: "서" },
            { quote: "\"유튜브 영상에서 재료만 쏙 뽑아주는 게 신기해요. 장 볼 때 그대로 체크리스트가 됩니다.\"", name: "박도현", sub: "주말 홈쿡", color: "#6E9A5B", abbr: "도" },
            { quote: "\"인스타에 저장한 디저트 레시피, 이제 태그로 한 번에 찾아요. 노션에 정리하던 시간이 사라졌어요.\"", name: "이지우", sub: "베이킹 클래스 운영", color: "#C98AA6", abbr: "지" },
            { quote: "\"가족 계정으로 같이 써요. 아내가 저장하면 제 폰에도 떠서 저녁 메뉴 정하기가 훨씬 쉬워졌어요.\"", name: "정민호", sub: "두 아이 아빠", color: "#5B7F9A", abbr: "민" },
          ].map((r) => (
            <div key={r.name} style={{ background: "#f5f5f7", borderRadius: 18, padding: 30 }}>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: "#1d1d1f", margin: "0 0 22px", letterSpacing: "-0.01em" }}>{r.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: r.color, color: "#fff", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.abbr}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: "#86868b" }}>{r.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING (client component for toggle) ── */}
      <PricingToggle />

      {/* ── FINAL CTA ── */}
      <section style={{ background: "#1d1d1f", padding: "110px 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em", margin: "0 0 20px" }}>오늘 저녁, 뭐 해 먹지?</h2>
        <p style={{ fontSize: 21, lineHeight: 1.5, color: "#a1a1a6", margin: "0 0 38px", letterSpacing: "-0.01em" }}>
          저장만 해둔 레시피부터 꺼내 보세요. 1분이면 정리가 끝납니다.
        </p>
        <Link href="/login"
          style={{ display: "inline-block", fontSize: 18, fontWeight: 500, color: "#fff", background: "#0066cc", borderRadius: 9999, padding: "15px 34px", textDecoration: "none", letterSpacing: "-0.01em" }}>
          무료로 시작하기
        </Link>
        <p style={{ fontSize: 13, color: "#6e6e73", margin: "20px 0 0" }}>신용카드 없이 · 레시피 50개까지 평생 무료</p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#f5f5f7", padding: "64px 24px 40px", color: "#6e6e73" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, paddingBottom: 48, borderBottom: "1px solid #e0e0e3" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookmarkIcon size={14} /></span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>Prepper</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, maxWidth: 240 }}>흩어진 레시피 링크를 한 곳에. 저장하면 요리가 되는 가장 쉬운 방법.</p>
            </div>
            {[
              { title: "제품", links: [{ label: "기능", href: "#features" }, { label: "가격", href: "#pricing" }, { label: "브라우저 확장", href: "#" }, { label: "모바일 앱", href: "#" }] },
              { title: "회사", links: [{ label: "소개", href: "#" }, { label: "후기", href: "#reviews" }, { label: "블로그", href: "#" }, { label: "채용", href: "#" }] },
              { title: "지원", links: [{ label: "도움말", href: "#" }, { label: "문의하기", href: "#" }, { label: "개인정보처리방침", href: "#" }, { label: "이용약관", href: "#" }] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 14 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 14 }}>
                  {col.links.map((link) => (
                    <a key={link.label} href={link.href} style={{ color: "#6e6e73", textDecoration: "none" }}>{link.label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 24, fontSize: 12, color: "#a1a1a6" }}>© 2026 Prepper. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOGGED-IN APP
══════════════════════════════════════════════════════════ */

function RecipeDetailPanel({ recipe }: { recipe: RecipeListItem }) {
  const source = sourceLabel(recipe.sourceType);

  return (
    <div
      style={{
        inset: 0,
        position: "fixed",
        zIndex: 70,
      }}
    >
      <Link
        aria-label="레시피 상세 닫기"
        href="/"
        style={{
          background: "rgba(29,29,31,0.42)",
          display: "block",
          inset: 0,
          position: "absolute",
          textDecoration: "none",
        }}
      />
      <aside
        style={{
          background: "#fff",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxWidth: "min(600px, calc(100vw - 32px))",
          overflow: "hidden",
          position: "absolute",
          right: 0,
          top: 0,
          width: 580,
        }}
      >
        <div style={{ background: gradientForSource(recipe.sourceType), flexShrink: 0, height: 148, position: "relative" }}>
          <Link
            href="/"
            style={{
              alignItems: "center",
              background: "rgba(255,255,255,0.9)",
              borderRadius: 9999,
              color: "#1d1d1f",
              display: "flex",
              fontSize: 18,
              height: 34,
              justifyContent: "center",
              position: "absolute",
              right: 16,
              textDecoration: "none",
              top: 16,
              width: 34,
            }}
          >
            ×
          </Link>
        </div>
        <div style={{ overflowY: "auto", padding: "22px 22px 28px" }}>
          <div style={{ color: "#86868b", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            {source} · 재료 {recipe.ingredients.length}개
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.18, margin: 0 }}>
            {recipe.title}
          </h2>
          <a
            href={recipe.sourceUrl}
            style={{
              color: "var(--warm)",
              display: "inline-flex",
              fontSize: 13,
              fontWeight: 700,
              marginTop: 14,
              textDecoration: "none",
            }}
          >
            원본 보기
          </a>

          <section style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>재료</h3>
            <ul style={{ display: "grid", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
              {recipe.ingredients.map((ingredient) => (
                <li
                  key={ingredient.rawText}
                  style={{
                    background: "#f5f5f7",
                    borderRadius: 10,
                    color: "#1d1d1f",
                    fontSize: 13,
                    lineHeight: 1.45,
                    padding: "10px 12px",
                  }}
                >
                  {ingredient.rawText}
                </li>
              ))}
            </ul>
          </section>

          <section style={{ marginTop: 26 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>조리 순서</h3>
            <ol style={{ display: "grid", gap: 12, listStyle: "none", margin: 0, padding: 0 }}>
              {recipe.steps.map((step, index) => (
                <li key={step} style={{ display: "flex", gap: 10, color: "#424245", fontSize: 14, lineHeight: 1.55 }}>
                  <span
                    style={{
                      alignItems: "center",
                      background: "#f0f0f2",
                      borderRadius: 8,
                      color: "#6e6e73",
                      display: "flex",
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      height: 24,
                      justifyContent: "center",
                      width: 24,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  );
}

async function AppHome({ recipes, reviewError, reviewRecipeId, selectedRecipeId, user, needsReviewCount }: {
  reviewError?: string;
  reviewRecipeId?: string;
  selectedRecipeId?: string;
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  recipes: RecipeListItem[];
  needsReviewCount: number;
}) {
  const savedRecipes = recipes.filter((recipe) => recipe.status === "saved");
  const reviewDrafts = recipes.filter((recipe) => recipe.status === "needs_review");
  const selectedRecipe = savedRecipes.find((recipe) => recipe.id === selectedRecipeId);
  const reviewRecipe = reviewDrafts.find((recipe) => recipe.id === reviewRecipeId);
  const youtubeCount = savedRecipes.filter((r) => r.sourceType === "youtube").length;
  const webCount = savedRecipes.filter((r) => r.sourceType !== "youtube").length;
  const savedCount = savedRecipes.length;

  const collections = [
    { label: "전체 레시피", count: savedRecipes.length, active: true },
    { label: "YouTube", count: youtubeCount, active: false },
    { label: "블로그 · 웹", count: webCount, active: false },
    { label: "즐겨찾기", count: savedCount, active: false },
    { label: "확인 필요", count: needsReviewCount, active: false },
  ];

  const displayName = user.email?.split("@")[0] ?? "나";
  const abbr = displayName.slice(0, 1).toUpperCase();

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fff", color: "#1d1d1f", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 264, flexShrink: 0, background: "#f5f5f7", borderRight: "1px solid #e8e8eb", display: "flex", flexDirection: "column", padding: "18px 14px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "#1d1d1f", padding: "4px 8px 18px" }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookmarkIcon /></span>
          <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>Prepper</span>
        </Link>

        <AddRecipeControl
          buttonStyle={{ alignItems: "center", justifyContent: "center", gap: 8, background: "var(--warm)", color: "#fff", border: "none", borderRadius: 11, cursor: "pointer", display: "flex", fontFamily: "inherit", padding: 12, fontSize: 15, fontWeight: 600, marginBottom: 22, letterSpacing: "-0.01em" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
          링크 추가
        </AddRecipeControl>

        <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", padding: "0 8px 8px", letterSpacing: "0.02em" }}>컬렉션</div>
        {collections.map((col) => (
          <div key={col.label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            borderRadius: 8, padding: "9px 10px", fontSize: 14, fontWeight: col.active ? 600 : 500, marginBottom: 1,
            background: col.active ? "rgba(199,90,46,0.1)" : "transparent",
            color: col.active ? "var(--warm)" : "#1d1d1f",
          }}>
            <span>{col.label}</span>
            <span style={{ fontSize: 12, color: col.active ? "var(--warm)" : "#b0b0b5" }}>{col.count}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderTop: "1px solid #e8e8eb" }}>
          <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#5B7F9A", color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {abbr}
          </span>
          <div style={{ flex: 1, lineHeight: 1.2, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
            <div style={{ fontSize: 11, color: "#86868b" }}>무료 플랜 · {savedRecipes.length}/50</div>
          </div>
          <form action={signOutAction}>
            <button type="submit" style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", fontSize: 12, color: "#86868b", fontFamily: "inherit" }}>
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* topbar */}
        <div style={{ height: 64, flexShrink: 0, borderBottom: "1px solid #ececef", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, maxWidth: 420, background: "#f0f0f2", borderRadius: 9999, padding: "9px 16px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ color: "#86868b", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 14, color: "#86868b" }}>레시피·재료·태그 검색</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            {needsReviewCount > 0 && (
              <Link
                href="/"
                style={{ fontSize: 13, fontWeight: 600, color: "#7a5420", background: "#fff0c2", borderRadius: 9999, padding: "6px 12px", textDecoration: "none", border: "1px solid #edd389" }}
              >
                확인 필요 {needsReviewCount}개
              </Link>
            )}
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#5B7F9A", color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {abbr}
            </span>
          </div>
        </div>

        {/* content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px 60px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
                전체 레시피
              </h1>
              <p style={{ fontSize: 14, color: "#86868b", margin: 0 }}>{savedRecipes.length}개의 완성된 레시피</p>
            </div>
            <AddRecipeControl
              buttonStyle={{ alignItems: "center", gap: 6, background: "var(--warm)", border: "none", color: "#fff", borderRadius: 11, cursor: "pointer", display: "inline-flex", fontFamily: "inherit", padding: "10px 16px", fontSize: 14, fontWeight: 600 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
              링크 추가
            </AddRecipeControl>
          </div>

          {reviewDrafts.length > 0 ? (
            <section style={{ marginBottom: 30 }}>
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h2 style={{ color: "#1d1d1f", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                    완성 대기
                  </h2>
                  <p style={{ color: "#86868b", fontSize: 13, margin: "4px 0 0" }}>
                    링크 분석은 끝났고, 부족한 정보를 채우면 저장함에 들어갑니다.
                  </p>
                </div>
                <span style={{ background: "#fff8e1", border: "1px solid #f1df9a", borderRadius: 9999, color: "#7a5420", fontSize: 12, fontWeight: 800, padding: "6px 10px" }}>
                  {reviewDrafts.length}개
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
                {reviewDrafts.map((recipe) => (
                  <RecipeGridCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </section>
          ) : null}

          {savedRecipes.length > 0 ? (
            <section>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
                {savedRecipes.map((recipe) => (
                  <RecipeGridCard
                    isSelected={recipe.id === selectedRecipe?.id}
                    key={recipe.id}
                    recipe={recipe}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#86868b" }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>아직 저장한 레시피가 없어요</div>
              <div style={{ fontSize: 14 }}>
                {reviewDrafts.length > 0 ? "완성 대기 카드의 정보를 채우면 저장함에 표시됩니다." : "위 버튼을 눌러 첫 레시피 링크를 정리해보세요."}
              </div>
            </div>
          )}
        </div>
      </main>
      {selectedRecipe ? <RecipeDetailPanel recipe={selectedRecipe} /> : null}
      {reviewRecipe ? (
        <RecipeReviewFunnel error={reviewError} recipe={reviewRecipe} />
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE ENTRY POINT
══════════════════════════════════════════════════════════ */
type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

export default async function Home({ searchParams }: HomeProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    return <LandingPage />;
  }

  const [savedRecipes, reviewDrafts, needsReviewCount] = await Promise.all([
    listSavedRecipes(),
    listReviewDrafts(),
    countReviewDrafts(),
  ]);
  const recipes = [...savedRecipes, ...reviewDrafts].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return (
    <AppHome
      needsReviewCount={needsReviewCount}
      recipes={recipes}
      reviewError={getSearchParam(params, "error")}
      reviewRecipeId={getSearchParam(params, "review")}
      selectedRecipeId={getSearchParam(params, "recipe")}
      user={user}
    />
  );
}
