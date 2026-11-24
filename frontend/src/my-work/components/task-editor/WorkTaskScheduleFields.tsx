import type { TaskPriority } from "../../../features/tasks/entities/task";
export function WorkTaskScheduleFields({
  priority,
  dueDate,
  minDate,
  onPriorityChange,
  onDueDateChange,
}: {
  priority: TaskPriority;
  dueDate: string;
  minDate?: string;
  onPriorityChange: (value: TaskPriority) => void;
  onDueDateChange: (value: string) => void;
}) {
  return (
    <div className="my-work-form-columns">
      <label>
        Priority
        <select
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value as TaskPriority)}
        >
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <label>
        Due date
        <input
          type="date"
          min={minDate}
          value={dueDate}
          onChange={(event) => onDueDateChange(event.target.value)}
        />
      </label>
    </div>
  );
}
