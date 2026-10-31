import { AlertTriangle, UserRound } from "lucide-react";
import type { Task } from "../../../entities/task";

function TaskCard({ task }: { task: Task }) {
  const priorityColor = task.priority === "urgent" ? "bg-rose-500"
    : task.priority === "high" ? "bg-orange-400"
      : task.priority === "medium" ? "bg-sky-400" : "bg-slate-300";
  const initials = task.assignee_name.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return <article draggable onDragStart={(event) => {
    event.dataTransfer.setData("text/plain", String(task.id));
    event.dataTransfer.effectAllowed = "move";
  }} className="flex min-h-12 cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 transition hover:border-violet-200 hover:shadow-sm active:cursor-grabbing">
    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${priorityColor}`} title={`${task.priority} priority`} />
    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800" title={task.title}>{task.title}</span>
    {task.blocked && <AlertTriangle size={14} aria-label="Blocked" className="shrink-0 text-rose-600" />}
    <span title={task.assignee === null ? "Unassigned" : `Assigned to ${task.assignee_name}`} className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-[10px] font-semibold text-violet-700">
      {task.assignee_photo_url ? <img src={task.assignee_photo_url} alt={task.assignee_name} className="h-full w-full object-cover" /> : task.assignee !== null ? initials : <UserRound size={15} className="text-gray-400" aria-hidden="true" />}
    </span>
  </article>;
}

export default TaskCard;
