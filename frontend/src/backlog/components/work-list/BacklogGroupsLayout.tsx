import type { ReactNode } from "react";

export function BacklogGroupsLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-6 p-4 md:p-5">{children}</div>;
}
