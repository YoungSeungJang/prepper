import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { AppNav } from "./app-nav";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header
      className="sticky top-0 z-20 border-b border-[#e8e8eb] backdrop-blur"
      style={{ background: "rgba(245,245,247,0.85)", backdropFilter: "saturate(180%) blur(20px)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" aria-label="Prepper 홈" className="inline-flex items-center gap-2 text-[#1d1d1f] no-underline">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--warm)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M6 3.5h12a1 1 0 0 1 1 1V20l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" fill="#fff" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">Prepper</span>
        </Link>

        {signedIn ? (
          <div className="flex items-center gap-1">
            <AppNav />
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-sm font-medium text-[#6e6e73] transition hover:bg-[#e8e8ec] hover:text-[#1d1d1f] sm:px-4"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#1d1d1f] no-underline">
              로그인
            </Link>
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "#0066cc", textDecoration: "none" }}
            >
              무료로 시작
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
