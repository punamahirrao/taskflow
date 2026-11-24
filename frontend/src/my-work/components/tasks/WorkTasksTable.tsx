import type { Task } from "../../../features/tasks/entities/task";
import type { WorkFilter } from "../../entities/work";
import type { WorkTaskRowData } from "../../entities/workTasks";
import { WorkTaskRow } from "./WorkTaskRow";
import { WorkTaskTableHead } from "./WorkTaskTableHead";
import { WorkTasksEmptyRow } from "./WorkTasksEmptyRow";
export function WorkTasksTable({
  rows,
  today,
  savingId,
  search,
  filter,
  onTask,
  onComplete,
}: {
  rows: WorkTaskRowData[];
  today: string;
  savingId: number | null;
  search: string;
  filter: WorkFilter;
  onTask: (task: Task) => void;
  onComplete: (task: Task) => Promise<void>;
}) {
  return (
    <div
      className="my-work-table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Assigned tasks table"
    >
      <table className="my-work-table">
        <WorkTaskTableHead />
        <tbody>
          {rows.map(({ task, project, canEdit }) => (
            <WorkTaskRow
              key={task.id}
              task={task}
              project={project}
              canEdit={canEdit}
              today={today}
              savingId={savingId}
              onTask={onTask}
              onComplete={onComplete}
            />
          ))}
          {!rows.length && <WorkTasksEmptyRow search={search} filter={filter} />}
        </tbody>
      </table>
    </div>
  );
}
