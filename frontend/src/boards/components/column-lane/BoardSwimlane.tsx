import type { ReactNode } from "react";

export function BoardSwimlane({
  children,
  name,
  showName,
}: {
  children: ReactNode;
  name: string;
  showName: boolean;
}) {
  return (
    <div className="space-y-2">
      {showName && (
        <h4 className="px-1 pt-1 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-wide text-muted">
          {name}
        </h4>
      )}
      {children}
    </div>
  );
}
