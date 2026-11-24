import type { ReactNode } from "react";

export function BoardColumnTaskStack({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
