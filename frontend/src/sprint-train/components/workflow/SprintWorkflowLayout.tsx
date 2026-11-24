import type { ReactNode } from "react";

export function SprintWorkflowLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="min-w-0 space-y-5">{children}</div>
    </div>
  );
}
