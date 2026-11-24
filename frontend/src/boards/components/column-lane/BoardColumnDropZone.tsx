import type { ReactNode } from "react";

export function BoardColumnDropZone({
  children,
  status,
  onMove,
}: {
  children: ReactNode;
  status: string;
  onMove: (taskId: number, status: string) => void;
}) {
  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onMove(Number(event.dataTransfer.getData("text/plain")), status);
      }}
      className="min-h-24 flex-1 rounded-lg border border-line/80 bg-surface/70 p-2"
    >
      {children}
    </section>
  );
}
