import type { ReactNode } from "react";
export function WorkContent({ children }: { children: ReactNode }) {
  return <div className="my-work-content">{children}</div>;
}
