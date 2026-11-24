import type { ReactNode } from "react";
import { startStoryDrag, allowStoryDrop } from "../shared/sprintDrag";

export function SprintStoryDragRow({
  children,
  taskId,
  onDropStory,
}: {
  children: ReactNode;
  taskId: number;
  onDropStory: (sourceId: number, targetId: number) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => startStoryDrag(event, taskId)}
      onDragOver={allowStoryDrop}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDropStory(Number(event.dataTransfer.getData("text/plain")), taskId);
      }}
      className="cursor-grab px-2 py-1 active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
