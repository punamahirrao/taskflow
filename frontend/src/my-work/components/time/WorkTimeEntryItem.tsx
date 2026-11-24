import { X } from "lucide-react";
import type { WorkTimeEntry } from "../../entities/workTime";
import { displayDate } from "../../utils/workDates";
import { duration } from "../../utils/workTime";
export function WorkTimeEntryItem({
  entry,
  onRemove,
}: {
  entry: WorkTimeEntry;
  onRemove: (id: string) => void;
}) {
  return (
    <li>
      <time dateTime={entry.date}>{displayDate(entry.date)}</time>
      <div className="my-work-list-label">
        <b>{entry.category}</b>
        {entry.note && <small>{entry.note}</small>}
      </div>
      <b>{duration(entry.minutes)}</b>
      <button
        type="button"
        className="my-work-icon-button"
        aria-label={`Remove ${entry.category} time from ${displayDate(entry.date)}`}
        onClick={() => onRemove(entry.id)}
      >
        <X size={16} />
      </button>
    </li>
  );
}
