import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { AppNav } from "./app-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-full bg-[#f7f6f2] text-[#1f2420]">
      <header className="sticky top-0 z-20 border-b border-[#ded8cf] bg-[#fffdfa]/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="grid leading-tight">
            <span className="text-lg font-bold tracking-tight">Prepper</span>
            <span className="text-[11px] font-semibold text-[#6f665c]">레시피 저장함</span>
          </Link>
          <div className="flex items-center gap-1">
            <AppNav />
            {user ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-sm font-bold text-[#625c54] transition hover:bg-[#ece6dd] sm:px-4"
                >
                  로그아웃
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-bold text-[#276f5f] transition hover:bg-[#dcefe6] sm:px-4"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        {children}
      </main>
    </div>
  );
}
