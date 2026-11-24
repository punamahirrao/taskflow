import type { ReactNode } from "react";

export function ComingUpPanel({ children }: { children: ReactNode }) {
  return (
    <section className="delivery-panel" aria-labelledby="delivery-milestones-title">
      {children}
    </section>
  );
}
