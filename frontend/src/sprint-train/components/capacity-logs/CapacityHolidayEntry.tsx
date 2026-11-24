import { Trash2 } from "lucide-react";
import type { CapacityHoliday } from "../../entities/capacity";
import { formatDate } from "../../utils/sprintTrain";

export function CapacityHolidayEntry({
  entry,
  busy,
  onRemove,
}: {
  entry: CapacityHoliday;
  busy: boolean;
  onRemove: () => void;
}) {
  return (
    <li>
      <div>
        <strong>{entry.name}</strong>
        <small>
          {formatDate(entry.start_date)} – {formatDate(entry.end_date)}
        </small>
      </div>
      {entry.can_delete && (
        <button disabled={busy} aria-label={`Remove holiday ${entry.name}`} onClick={onRemove}>
          <Trash2 size={14} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
