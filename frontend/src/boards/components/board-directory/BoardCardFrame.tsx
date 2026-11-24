import type { ReactNode } from "react";

export function BoardCardFrame({ children }: { children: ReactNode }) {
  return (
    <article className="relative flex min-h-64 flex-col rounded-2xl border border-line bg-surface shadow-sm">
      {children}
    </article>
  );
}
