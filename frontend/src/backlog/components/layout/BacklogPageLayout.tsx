import type { ReactNode } from "react";

export function BacklogPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8">
      <div className="mx-auto max-w-[1440px]">{children}</div>
    </main>
  );
}
