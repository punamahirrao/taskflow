import type { Task, WorkflowStatus } from "../../../features/tasks/entities/task";
export function WorkTaskStatusField({
  task,
  status,
  statuses,
  onChange,
}: {
  task: Task;
  status: string;
  statuses: WorkflowStatus[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      Status
      <select
        value={status}
        disabled={!statuses.length}
        onChange={(event) => onChange(event.target.value)}
      >
        {!statuses.some((item) => item.key === task.status) && (
          <option value={task.status}>{task.status.replaceAll("_", " ")}</option>
        )}
        {statuses.map((item) => (
          <option key={item.key} value={item.key}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
