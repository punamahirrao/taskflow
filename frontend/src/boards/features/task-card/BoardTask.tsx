import type { Task } from "../../../features/tasks/entities/task";
import { BoardTaskDragFrame } from "../../components/task-card/BoardTaskDragFrame";
import { BoardTaskCard } from "../../components/task-card/BoardTaskCard";
export function BoardTask({ task, onOpen }: { task: Task; onOpen: () => void }) {
  return (
    <BoardTaskDragFrame taskId={task.id}>
      <BoardTaskCard task={task} onOpen={onOpen} />
    </BoardTaskDragFrame>
  );
}
