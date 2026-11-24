import type { Task } from "../../../features/tasks/entities/task";
import { displayDate } from "../../utils/workDates";
export function WorkAgendaItem({ task, onTask }: { task: Task; onTask: (task: Task) => void }) {
  return (
    <li>
      <span className={`my-work-dot ${task.priority}`} />
      <time dateTime={task.due_date!}>{displayDate(task.due_date!)}</time>
      <button type="button" className="my-work-item-link" onClick={() => onTask(task)}>
        {task.title}
        <small>{task.project_name}</small>
      </button>
    </li>
  );
}
