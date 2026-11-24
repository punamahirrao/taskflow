import type { ReactNode } from "react";

export function BoardDirectoryGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
