"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/recipes", label: "저장함" },
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
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              isNavItemActive(item.href, pathname)
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-2 py-2 text-center text-xs font-semibold transition ${
                isNavItemActive(item.href, pathname)
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
