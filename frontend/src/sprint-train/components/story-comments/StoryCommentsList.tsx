import type { ReactNode } from "react";

export function StoryCommentsList({ children }: { children: ReactNode }) {
  return <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>;
}
