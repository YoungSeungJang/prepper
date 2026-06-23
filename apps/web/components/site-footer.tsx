import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#eadfce] bg-[#f7f1e8]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-[#7b6f61] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Prepper는 저장한 레시피 링크를 다시 요리하기 쉬운 형태로 정리합니다.</p>
        <div className="flex gap-4">
          <Link href="/" className="font-medium transition hover:text-[#201a14]">
            홈
          </Link>
          <Link href="/recipes" className="font-medium transition hover:text-[#201a14]">
            저장함
          </Link>
        </div>
      </div>
    </footer>
  );
}
