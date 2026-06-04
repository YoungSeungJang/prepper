"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "오늘" },
  { href: "/recipes", label: "저장함" },
  { href: "/recipes/new", label: "추가" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/recipes") {
      return pathname === "/recipes" || /^\/recipes\/(?!new(?:\/|$))/.test(pathname);
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-full bg-[#f7f6f2] text-[#1f2420]">
      <header className="sticky top-0 z-20 border-b border-[#ded8cf] bg-[#fffdfa]/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="grid leading-tight">
            <span className="text-lg font-bold tracking-tight">Prepper</span>
            <span className="text-[11px] font-semibold text-[#6f665c]">레시피 저장함</span>
          </Link>
          <div className="flex items-center gap-1">
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive(item.href)
                      ? "bg-[#1f2420] text-white"
                      : "text-[#625c54] hover:bg-[#ece6dd] hover:text-[#1f2420]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/login"
              className={`rounded-full px-3 py-2 text-sm font-bold transition sm:px-4 ${
                pathname === "/login"
                  ? "bg-[#276f5f] text-white"
                  : "text-[#276f5f] hover:bg-[#dcefe6]"
              }`}
            >
              로그인
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ded8cf] bg-[#fffdfa]/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(45,31,18,0.08)] backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2 py-2 text-center text-xs font-bold transition ${
                isActive(item.href)
                  ? "bg-[#1f2420] text-white"
                  : "text-[#625c54] hover:bg-[#ece6dd] hover:text-[#1f2420]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
