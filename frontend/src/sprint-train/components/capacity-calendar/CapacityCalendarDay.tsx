import type { SprintCapacity } from "../../entities/capacity";
import { formatDate } from "../../utils/sprintTrain";

export function CapacityCalendarDay({
  day,
  memberCount,
}: {
  day: SprintCapacity["calendar"][number];
  memberCount: number;
}) {
  return (
    <li
      data-state={
        day.weekend || day.holidays.length
          ? "off"
          : day.available_members === 0
            ? "gap"
            : day.available_members < memberCount
              ? "reduced"
              : "full"
      }
      title={`${formatDate(day.date)} · ${day.holidays.join(", ") || (day.weekend ? "Weekend" : `${day.available_members} available members`)}`}
    >
      <span>
        {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
        })}
      </span>
      <strong>{day.weekend ? "—" : day.holidays.length ? "Holiday" : day.available_members}</strong>
    </li>
  );
}
