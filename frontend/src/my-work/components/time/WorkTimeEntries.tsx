import type { WorkTimeEntry } from "../../entities/workTime";
import { WorkTimeEntryItem } from "./WorkTimeEntryItem";
import { WorkTimeEmptyState } from "./WorkTimeEmptyState";
export function WorkTimeEntries({
  entries,
  onRemove,
}: {
  entries: WorkTimeEntry[];
  onRemove: (id: string) => void;
}) {
  return (
    <ul className="my-work-list">
      {entries.map((entry) => (
        <WorkTimeEntryItem key={entry.id} entry={entry} onRemove={onRemove} />
      ))}
      {!entries.length && <WorkTimeEmptyState />}
    </ul>
  );
}
