import type { ReactNode } from "react";
export function WorkTasksPanel({ children }: { children: ReactNode }) {
  return <section className="my-work-panel my-work-tasks">{children}</section>;
}
