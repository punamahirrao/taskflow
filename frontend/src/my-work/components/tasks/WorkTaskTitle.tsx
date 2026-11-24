import { Link } from "react-router-dom";
import { OctagonAlert } from "lucide-react";
import type { Task } from "../../../features/tasks/entities/task";
export function WorkTaskTitle({
  task,
  canEdit,
  onTask,
}: {
  task: Task;
  canEdit: boolean;
  onTask: (task: Task) => void;
}) {
  return (
    <>
      {canEdit ? (
        <button type="button" className="my-work-task-title" onClick={() => onTask(task)}>
          {task.title}
        </button>
      ) : (
        <Link className="my-work-task-title" to={`/project/${task.project}`}>
          {task.title}
        </Link>
      )}
      {task.blocked && <OctagonAlert size={13} className="my-work-blocked" aria-label="Blocked" />}
    </>
  );
}
