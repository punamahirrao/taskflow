import type { CSSProperties, ReactNode } from "react";

export function SprintPipelineTrack({ children, count }: { children: ReactNode; count: number }) {
  return (
    <div
      className="sprint-pipeline-track"
      style={{ "--sprint-columns": Math.min(3, Math.max(count, 1)) } as CSSProperties}
    >
      {children}
    </div>
  );
}
