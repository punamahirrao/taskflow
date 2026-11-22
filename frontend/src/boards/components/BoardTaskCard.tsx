import Avatar from "../../common/components/Avatar";
import type { Task } from "../../features/tasks/entities/task";

interface BoardTaskCardProps {
  task: Task;
  onOpen: () => void;
}

export function BoardTaskCard({ task, onOpen }: BoardTaskCardProps) {
  const assignedName = task.assignee_name?.trim() || "Unassigned";

  return (
    <article
      data-testid={`board-task-${task.id}`}
      tabIndex={0}
      aria-label={`NEX-${task.id}: ${task.title}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group relative min-w-0 cursor-pointer rounded-lg border border-line bg-surface p-3 shadow-sm transition hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="mb-1 block text-[11px] font-bold tracking-wide text-accent">
        NEX-{task.id}
      </span>
      <h4 className="line-clamp-2 break-words text-sm font-semibold leading-5 text-content">
        {task.title}
      </h4>
      <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-line/70 pt-2">
        <Avatar name={assignedName} photoUrl={task.assignee_photo_url} size={26} />
        <span className="truncate text-xs font-medium text-muted">{assignedName}</span>
      </div>
    </article>
  );
}
