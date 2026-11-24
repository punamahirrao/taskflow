import { Trash2 } from "lucide-react";
import type { CapacityAbsence } from "../../entities/capacity";
import { formatDate } from "../../utils/sprintTrain";

export function CapacityAbsenceEntry({
  entry,
  memberName,
  busy,
  onRemove,
}: {
  entry: CapacityAbsence;
  memberName: string;
  busy: boolean;
  onRemove: () => void;
}) {
  return (
    <li>
      <div>
        <strong>{memberName}</strong> · {entry.kind === "vacation" ? "Vacation" : "Absence"}
        <small>
          {formatDate(entry.start_date)} – {formatDate(entry.end_date)}
          {entry.day_fraction === 0.5 ? " · Half day each day" : ""}
        </small>
        {entry.note && <small>{entry.note}</small>}
      </div>
      {entry.can_delete && (
        <button
          disabled={busy}
          aria-label={`Remove ${entry.kind} for ${memberName}`}
          onClick={onRemove}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
