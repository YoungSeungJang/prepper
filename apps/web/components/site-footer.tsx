import Link from "next/link";

const footerCols = [
  {
    title: "제품",
    links: [
      { href: "/#features", label: "기능" },
      { href: "/#pricing", label: "가격" },
      { href: "/", label: "서비스 홈" },
    ],
  },
  {
    title: "회사",
    links: [
      { href: "#", label: "소개" },
      { href: "/#reviews", label: "후기" },
      { href: "#", label: "블로그" },
      { href: "#", label: "채용" },
    ],
  },
  {
    title: "지원",
    links: [
      { href: "#", label: "도움말" },
      { href: "#", label: "문의하기" },
      { href: "#", label: "개인정보처리방침" },
      { href: "#", label: "이용약관" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#e8e8eb] bg-[#f5f5f7]">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[#1d1d1f] no-underline">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-[7px]"
                style={{ background: "var(--warm)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M6 3.5h12a1 1 0 0 1 1 1V20l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" fill="#fff" />
                </svg>
              </span>
              <span className="text-base font-bold tracking-tight">Prepper</span>
            </Link>
            <p className="mt-3 max-w-[240px] text-sm leading-6 text-[#6e6e73]">
              흩어진 레시피 링크를 한 곳에. 저장하면 요리가 되는 가장 쉬운 방법.
            </p>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold text-[#1d1d1f]">{col.title}</h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6e6e73] transition hover:text-[#1d1d1f]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[#e0e0e3] pt-5 text-xs text-[#a1a1a6]">
          © {year} Prepper. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
