import type { ReactNode } from "react";

export function ActiveSprintsPanel({ children }: { children: ReactNode }) {
  return (
    <section className="delivery-panel" aria-labelledby="delivery-sprints-title">
      {children}
    </section>
  );
}
