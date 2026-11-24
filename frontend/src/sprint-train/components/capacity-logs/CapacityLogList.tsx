import type { ReactNode } from "react";

export function CapacityLogList({ children }: { children: ReactNode }) {
  return <ul className="capacity-log-list">{children}</ul>;
}
