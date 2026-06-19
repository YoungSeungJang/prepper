import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { AppNav } from "./app-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-full bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Prepper 홈" className="inline-flex items-center">
            <Image
              src="/prepper_logo.png"
              alt="Prepper"
              width={1237}
              height={339}
              priority
              unoptimized
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-1">
            <AppNav />
            {user ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:px-4"
                >
                  로그아웃
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:px-4"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        {children}
      </main>
    </div>
  );
}
