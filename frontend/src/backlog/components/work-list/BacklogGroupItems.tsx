import type { ReactNode } from "react";

export function BacklogGroupItems({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
