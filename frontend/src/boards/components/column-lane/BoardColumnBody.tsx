import type { ReactNode } from "react";

export function BoardColumnBody({ children }: { children: ReactNode }) {
  return <div className="flex min-h-48 flex-1 flex-col gap-2">{children}</div>;
}
