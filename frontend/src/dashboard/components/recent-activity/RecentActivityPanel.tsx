import type { ReactNode } from "react";
export function RecentActivityPanel({ children }: { children: ReactNode }) {
  return (
    <section className="delivery-panel" aria-labelledby="delivery-activity-title">
      {children}
    </section>
  );
}
