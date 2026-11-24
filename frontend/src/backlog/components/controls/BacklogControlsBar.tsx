import type { ReactNode } from "react";

export function BacklogControlsBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 md:px-5">
      {children}
    </div>
  );
}
