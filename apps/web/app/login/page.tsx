import { AppShell } from "@/components/app-shell";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-2xl border border-[#eadccd] bg-[#fffaf3] p-6 shadow-[0_14px_42px_rgba(51,33,20,0.08)]">
        <p className="text-sm font-semibold text-[#8a7564]">저장한 레시피를 다시 열려면</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#211b16]">
          이메일로 시작하기
        </h1>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-800" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-12 rounded-lg border border-[#d8c8b8] bg-white px-3 text-sm outline-none focus:border-[#2f6f5e]"
            />
          </div>
          <button
            type="button"
            className="h-12 rounded-full bg-[#2f6f5e] px-4 text-sm font-semibold text-white hover:bg-[#285f51]"
          >
            로그인 링크 받기
          </button>
        </form>
      </div>
    </AppShell>
  );
}
