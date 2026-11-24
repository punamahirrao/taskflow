import type { ReactNode } from "react";

export function BacklogWorkspacePanel({ children }: { children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {children}
    </section>
  );
}
