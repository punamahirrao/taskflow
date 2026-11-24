import type { ReactNode } from "react";

export function AccessInboxPanel({ children }: { children: ReactNode }) {
  return (
    <section className="project-request-inbox" aria-labelledby="access-inbox-title">
      {children}
    </section>
  );
}
