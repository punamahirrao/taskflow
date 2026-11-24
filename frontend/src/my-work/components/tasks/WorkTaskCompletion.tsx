import { Check } from "lucide-react";
import type { Task } from "../../../features/tasks/entities/task";
export function WorkTaskCompletion({
  task,
  canEdit,
  savingId,
  onComplete,
}: {
  task: Task;
  canEdit: boolean;
  savingId: number | null;
  onComplete: (task: Task) => Promise<void>;
}) {
  const completeTask = task.status === "done";
  return (
    <>
      {completeTask ? (
        <Check size={17} className="text-positive" aria-label="Completed" />
      ) : (
        canEdit && (
          <button
            type="button"
            className="my-work-complete"
            aria-label={`Mark ${task.title} complete`}
            disabled={savingId !== null}
            onClick={() => void onComplete(task)}
          >
            {savingId === task.id && <span>…</span>}
          </button>
        )
      )}
    </>
  );
}
