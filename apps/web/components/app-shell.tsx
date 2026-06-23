import { getCurrentUser } from "@/lib/auth";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-col bg-[#f7f1e8] text-[#201a14]">
      <SiteHeader signedIn={Boolean(user)} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pb-12 sm:pt-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
