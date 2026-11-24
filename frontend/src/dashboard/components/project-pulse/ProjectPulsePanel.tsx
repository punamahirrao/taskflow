import type { ReactNode } from "react";
export function ProjectPulsePanel({ children }: { children: ReactNode }) {
  return (
    <section className="delivery-panel" aria-labelledby="delivery-projects-title">
      {children}
    </section>
  );
}
