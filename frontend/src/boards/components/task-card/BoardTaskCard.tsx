import type { Task } from "../../../features/tasks/entities/task";
import { BoardTaskCardFrame } from "./BoardTaskCardFrame";
import { BoardTaskTitle } from "./BoardTaskTitle";
import { BoardTaskAssignee } from "./BoardTaskAssignee";

export function BoardTaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const assignedName = task.assignee_name?.trim() || "Unassigned";
  return (
    <BoardTaskCardFrame taskId={task.id} title={task.title} onOpen={onOpen}>
      <BoardTaskTitle taskId={task.id} title={task.title} />
      <BoardTaskAssignee name={assignedName} photoUrl={task.assignee_photo_url} />
    </BoardTaskCardFrame>
  );
}
