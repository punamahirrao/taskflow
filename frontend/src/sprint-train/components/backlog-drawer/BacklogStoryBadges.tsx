import type { Task } from "../../../features/tasks/entities/task";

export function BacklogStoryBadges({ task }: { task: Task }) {
  return (
    <div className="sprint-backlog-card-badges">
      <span className="sprint-backlog-category rounded-full px-2 py-0.5 text-[calc(9px*var(--taskflow-font-scale,1))] font-medium capitalize">
        {task.work_type.replaceAll("_", " ")}
      </span>
      {task.tags.map((label) => (
        <span key={label} className="sprint-backlog-card-label">
          {label}
        </span>
      ))}
    </div>
  );
}
