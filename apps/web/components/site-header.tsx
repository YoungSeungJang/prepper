import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { AppNav } from "./app-nav";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#eadfce] bg-[#f7f1e8]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" aria-label="Prepper 홈" className="inline-flex items-center">
          <Image
            src="/prepper_logo.png"
            alt="Prepper"
            width={1237}
            height={339}
            priority
            unoptimized
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        {signedIn ? (
          <div className="flex items-center gap-1">
            <AppNav />
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-sm font-medium text-[#6c5d4c] transition hover:bg-[#eadfce] hover:text-[#201a14] sm:px-4"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login?next=%2Frecipes%2Fnew"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2f3b22] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#25301b]"
          >
            레시피 정리하기
          </Link>
        )}
      </div>
    </header>
  );
}
