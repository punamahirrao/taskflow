import type { CSSProperties, ReactNode } from "react";

export function BoardWorkflowGrid({ count, children }: { count: number; children: ReactNode }) {
  return (
    <div
      className="board-workflow-grid grid min-h-0 w-full flex-1 items-stretch gap-3 pb-4"
      style={{ "--board-column-count": count } as CSSProperties}
    >
      {children}
    </div>
  );
}
