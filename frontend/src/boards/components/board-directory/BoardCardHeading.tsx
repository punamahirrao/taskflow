import { Columns3 } from "lucide-react";
import type { BoardCardProps } from "../../entities/boardCard";

export function BoardCardHeading({ board, project }: Pick<BoardCardProps, "board" | "project">) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid size-14 place-items-center rounded-xl bg-accent/10 text-accent">
        <Columns3 size={25} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-bold text-content">{board.name}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span
            className={`rounded-md px-2 py-1 font-semibold ${board.board_type === "scrum" ? "bg-accent/10 text-accent" : "bg-warning-soft text-warning"}`}
          >
            {board.board_type === "scrum" ? "Scrum" : "Kanban"}
          </span>
          <span>{project?.name ?? `Project ${board.project}`}</span>
        </span>
      </span>
    </div>
  );
}
