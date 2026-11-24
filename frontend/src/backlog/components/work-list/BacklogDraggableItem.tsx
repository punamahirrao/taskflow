import { useState, type ReactNode } from "react";

export function BacklogDraggableItem({
  children,
  taskId,
  reordering = false,
  onMove,
}: {
  children: ReactNode;
  taskId: number;
  reordering?: boolean;
  onMove: (sourceId: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(false);
  return (
    <div
      draggable={!reordering}
      aria-busy={reordering}
      aria-grabbed={dragging}
      onDragStart={(event) => {
        setDragging(true);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(taskId));
      }}
      onDragEnd={() => {
        setDragging(false);
        setDragTarget(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragTarget(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragTarget(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragTarget(false);
        if (reordering) return;
        onMove(Number(event.dataTransfer.getData("text/plain")));
      }}
      className={`rounded-2xl transition duration-200 ${dragging ? "scale-[.99] opacity-45" : "opacity-100"} ${dragTarget ? "translate-y-1 ring-2 ring-violet-400 shadow-lg" : ""}`}
    >
      {children}
    </div>
  );
}
