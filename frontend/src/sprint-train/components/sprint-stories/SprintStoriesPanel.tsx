import type { ReactNode } from "react";
import { allowStoryDrop } from "../shared/sprintDrag";

export function SprintStoriesPanel({
  children,
  onDropStory,
}: {
  children: ReactNode;
  onDropStory: (id: number) => void;
}) {
  return (
    <section
      onDragOver={allowStoryDrop}
      onDrop={(event) => {
        event.preventDefault();
        onDropStory(Number(event.dataTransfer.getData("text/plain")));
      }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {children}
    </section>
  );
}
