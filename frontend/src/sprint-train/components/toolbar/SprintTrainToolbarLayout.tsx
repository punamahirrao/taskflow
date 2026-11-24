import type { ReactNode } from "react";

export function SprintTrainToolbarLayout({ children }: { children: ReactNode }) {
  return (
    <section className="sprint-train-toolbar mb-5 rounded-xl border border-slate-200 bg-white p-3">
      {children}
    </section>
  );
}
