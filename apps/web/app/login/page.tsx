import { AppShell } from "@/components/app-shell";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-xl border border-[#d8d0c6] bg-[#fffdfa] p-6 shadow-[0_14px_34px_rgba(34,29,24,0.07)]">
        <p className="text-sm font-bold text-[#276f5f]">저장한 레시피를 다시 열려면</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1f2420]">
          이메일로 시작하기
        </h1>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-bold text-[#1f2420]" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-12 rounded-lg border border-[#cfc6bb] bg-white px-3 text-sm outline-none focus:border-[#276f5f]"
            />
          </div>
          <button
            type="button"
            className="h-12 rounded-full bg-[#276f5f] px-4 text-sm font-bold text-white hover:bg-[#1f5b4f]"
          >
            로그인 링크 받기
          </button>
        </form>
      </div>
    </AppShell>
  );
}
