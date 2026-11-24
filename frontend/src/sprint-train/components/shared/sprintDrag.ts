import type { DragEvent } from "react";

export function startStoryDrag(event: DragEvent<HTMLElement>, taskId: number) {
  event.dataTransfer.setData("text/plain", String(taskId));
  event.dataTransfer.effectAllowed = "move";
}
export function allowStoryDrop(event: DragEvent<HTMLElement>) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}
