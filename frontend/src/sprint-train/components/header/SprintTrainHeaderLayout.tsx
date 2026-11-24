import type { ReactNode } from "react";

export function SprintTrainHeaderLayout({ children }: { children: ReactNode }) {
  return (
    <section
      data-testid="app-header"
      className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      {children}
    </section>
  );
}
