import type { ReactNode } from "react";

export function BacklogStoryList({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">{children}</div>;
}
