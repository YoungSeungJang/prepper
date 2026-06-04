"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "오늘" },
  { href: "/recipes", label: "저장함" },
  { href: "/recipes/new", label: "추가" },
];

export function isNavItemActive(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/recipes") {
    return pathname === "/recipes" || /^\/recipes\/(?!new(?:\/|$))/.test(pathname);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 sm:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isNavItemActive(item.href, pathname)
                ? "bg-[#1f2420] text-white"
                : "text-[#625c54] hover:bg-[#ece6dd] hover:text-[#1f2420]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ded8cf] bg-[#fffdfa]/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(45,31,18,0.08)] backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2 py-2 text-center text-xs font-bold transition ${
                isNavItemActive(item.href, pathname)
                  ? "bg-[#1f2420] text-white"
                  : "text-[#625c54] hover:bg-[#ece6dd] hover:text-[#1f2420]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
