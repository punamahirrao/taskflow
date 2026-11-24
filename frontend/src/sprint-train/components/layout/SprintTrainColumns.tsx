import type { ReactNode } from "react";

export function SprintTrainColumns({
  content,
  backlog,
}: {
  content: ReactNode;
  backlog: ReactNode;
}) {
  return (
    <div className="sprint-train-layout">
      <div className="min-w-0">{content}</div>
      {backlog}
    </div>
  );
}
