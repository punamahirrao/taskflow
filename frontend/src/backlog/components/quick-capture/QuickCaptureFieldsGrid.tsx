import type { ReactNode } from "react";

export function QuickCaptureFieldsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}
