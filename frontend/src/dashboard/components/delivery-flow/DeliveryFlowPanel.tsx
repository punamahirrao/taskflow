import type { ReactNode } from "react";
export function DeliveryFlowPanel({ children }: { children: ReactNode }) {
  return (
    <section className="delivery-panel delivery-trend" aria-labelledby="delivery-trend-title">
      {children}
    </section>
  );
}
