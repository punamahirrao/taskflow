import type { Task } from "../../../features/tasks/entities/task";
import { AlertTriangle } from "lucide-react";

export function SprintDependencyBadge({ task }: { task: Task }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700">
      <AlertTriangle size={12} />
      NEX-{task.id}: {task.title}
    </span>
  );
}
