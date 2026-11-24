import type { ReactNode } from "react";
export function NeedsAttentionPanel({ children }: { children: ReactNode }) {
  return (
    <section className="delivery-panel" aria-labelledby="delivery-attention-title">
      {children}
    </section>
  );
}
