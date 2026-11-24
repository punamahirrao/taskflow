import type { ReactNode } from "react";

export function DeliverySummaryPanel({ children }: { children: ReactNode }) {
  return (
    <section className="delivery-hero" aria-labelledby="delivery-hero-title">
      {children}
    </section>
  );
}
