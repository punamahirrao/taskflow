import type { ReactNode } from "react";

export function BoardTaskDragFrame({ taskId, children }: { taskId: number; children: ReactNode }) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", String(taskId));
        event.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
