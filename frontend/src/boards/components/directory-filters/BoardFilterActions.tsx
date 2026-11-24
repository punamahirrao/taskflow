import type { ReactNode } from "react";

export function BoardFilterActions({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex flex-wrap gap-2">{children}</div>;
}
