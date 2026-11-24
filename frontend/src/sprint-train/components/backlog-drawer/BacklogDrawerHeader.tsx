import type { ReactNode } from "react";

export function BacklogDrawerHeader({ children }: { children: ReactNode }) {
  return <header className="sprint-backlog-header border-b p-4">{children}</header>;
}
