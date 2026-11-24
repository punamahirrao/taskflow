import type { TaskHistoryEntry } from "../../../features/tasks/entities/taskActivity";
import { StoryHistoryChange } from "./StoryHistoryChange";

export function StoryHistoryChanges({ changes }: { changes: TaskHistoryEntry["changes"] }) {
  return (
    <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
      {Object.entries(changes).map(([field, change]) => (
        <StoryHistoryChange key={field} field={field} change={change} />
      ))}
    </ul>
  );
}
