import { Link } from "react-router-dom";
import type { Project } from "../../../common/entities/project";
import type { Task } from "../../../features/tasks/entities/task";
import { displayDueDate } from "../../utils/workDates";
import { WorkTaskCompletion } from "./WorkTaskCompletion";
import { WorkTaskTitle } from "./WorkTaskTitle";
export function WorkTaskRow({
  task,
  project,
  canEdit,
  today,
  savingId,
  onTask,
  onComplete,
}: {
  task: Task;
  project?: Project;
  canEdit: boolean;
  today: string;
  savingId: number | null;
  onTask: (task: Task) => void;
  onComplete: (task: Task) => Promise<void>;
}) {
  const completeTask = task.status === "done";
  return (
    <tr>
      <td>
        <WorkTaskCompletion
          task={task}
          canEdit={canEdit}
          savingId={savingId}
          onComplete={onComplete}
        />
      </td>
      <td>
        <WorkTaskTitle task={task} canEdit={canEdit} onTask={onTask} />
      </td>
      <td>
        <Link className="my-work-project-link" to={`/project/${task.project}`}>
          {task.project_name ?? project?.name ?? "View project"}
        </Link>
      </td>
      <td>
        <span className={`my-work-badge priority-${task.priority}`}>{task.priority}</span>
      </td>
      <td
        className={
          !completeTask && task.due_date && task.due_date <= today ? "my-work-due" : undefined
        }
      >
        {displayDueDate(task.due_date, today)}
      </td>
      <td>
        <span className={`my-work-badge status-${task.status}`}>
          {task.status.replaceAll("_", " ")}
        </span>
      </td>
    </tr>
  );
}
