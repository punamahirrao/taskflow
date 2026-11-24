import type { ReactNode } from "react";

export function BacklogDrawerSummary({ children }: { children: ReactNode }) {
  return <div className="sprint-backlog-summary">{children}</div>;
}
