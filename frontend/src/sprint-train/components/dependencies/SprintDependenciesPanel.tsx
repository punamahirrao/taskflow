import type { ReactNode } from "react";

export function SprintDependenciesPanel({ children }: { children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {children}
    </section>
  );
}
