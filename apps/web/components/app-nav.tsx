"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈" },
];

export function isNavItemActive(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
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
            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
              isNavItemActive(item.href, pathname)
                ? "text-white"
                : "text-[#6e6e73] hover:bg-[#e8e8ec] hover:text-[#1d1d1f]"
            }`}
            style={isNavItemActive(item.href, pathname) ? { background: "var(--warm)" } : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8e8eb] bg-[#f5f5f7]/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-1 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-2 py-2 text-center text-xs font-semibold transition ${
                isNavItemActive(item.href, pathname)
                  ? "text-white"
                  : "text-[#6e6e73] hover:bg-[#e8e8ec] hover:text-[#1d1d1f]"
              }`}
              style={isNavItemActive(item.href, pathname) ? { background: "var(--warm)" } : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
