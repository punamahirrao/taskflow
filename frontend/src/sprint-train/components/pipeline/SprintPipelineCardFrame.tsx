import type { ReactNode } from "react";
import { allowStoryDrop } from "../shared/sprintDrag";

export function SprintPipelineCardFrame({
  children,
  selected,
  onSelect,
  onDropStory,
}: {
  children: ReactNode;
  selected: boolean;
  onSelect: () => void;
  onDropStory: (id: number) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onClick={onSelect}
      onDragOver={allowStoryDrop}
      onDrop={(event) => {
        event.preventDefault();
        onDropStory(Number(event.dataTransfer.getData("text/plain")));
      }}
      className={`group cursor-pointer rounded-xl border bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md ${selected ? "sprint-selected" : "border-slate-200"}`}
    >
      {children}
    </div>
  );
}
