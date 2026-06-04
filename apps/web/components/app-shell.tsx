import Link from "next/link";

const navItems = [
  { href: "/", label: "오늘" },
  { href: "/recipes", label: "저장함" },
  { href: "/recipes/new", label: "추가" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#f6f1ea] text-[#211b16]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#fffaf3]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="grid leading-tight">
            <span className="text-lg font-semibold tracking-tight">Prepper</span>
            <span className="text-[11px] font-medium text-[#76685c]">
              저장한 레시피를 오늘의 메뉴로
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#746255] hover:bg-[#efe3d5] hover:text-[#211b16]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-[#fffaf3]/95 px-4 py-2 shadow-[0_-8px_30px_rgba(45,31,18,0.08)] backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-2 text-center text-xs font-semibold text-[#6d5e52] hover:bg-[#efe3d5] hover:text-[#211b16]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
