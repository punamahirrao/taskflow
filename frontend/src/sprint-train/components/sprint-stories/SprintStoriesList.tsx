import type { ReactNode } from "react";

export function SprintStoriesList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-slate-100">{children}</div>;
}
