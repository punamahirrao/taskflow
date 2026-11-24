import type { ReactNode } from "react";

export function StoryHistoryList({ children }: { children: ReactNode }) {
  return <ol className="relative ml-2 space-y-5 border-l border-slate-200 pl-5">{children}</ol>;
}
