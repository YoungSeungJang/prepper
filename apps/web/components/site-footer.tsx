import Link from "next/link";

const footerSections = [
  {
    kind: "links",
    title: "서비스",
    links: [
      { href: "/", label: "홈" },
      { href: "/recipes/new", label: "레시피 정리하기" },
      { href: "/recipes", label: "저장함" },
    ],
  },
  {
    kind: "links",
    title: "계정",
    links: [
      { href: "/login", label: "로그인" },
      { href: "/login?next=%2Frecipes%2Fnew", label: "시작하기" },
    ],
  },
  {
    kind: "text",
    title: "준비 중",
    items: ["가격 정보", "재료 상품 후보"],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#eadfce] bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight text-[#201a14]">
              Prepper
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#7b6f61]">
              흩어진 레시피 링크를 재료와 조리 순서 중심의 저장 가능한 초안으로 정리합니다.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold text-[#201a14]">{section.title}</h2>
              {section.kind === "links" ? (
                <ul className="mt-3 grid gap-2">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#7b6f61] transition hover:text-[#201a14]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {section.items.map((item) => (
                    <li key={`${section.title}-${item}`} className="text-sm text-[#8a7a68]">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#eadfce] pt-5 text-xs text-[#8a7a68] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Prepper. All rights reserved.</p>
          <p>링크를 저장하고, 다시 요리할 수 있게 정리합니다.</p>
        </div>
      </div>
    </footer>
  );
}
