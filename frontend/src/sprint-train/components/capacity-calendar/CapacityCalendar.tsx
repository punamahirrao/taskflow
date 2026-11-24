import type { SprintCapacity } from "../../entities/capacity";
import { CapacityCalendarDay } from "./CapacityCalendarDay";

export function CapacityCalendar({
  days,
  totalCount,
  memberCount,
  expanded,
  onToggle,
}: {
  days: SprintCapacity["calendar"];
  totalCount: number;
  memberCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="capacity-panel" aria-label="Daily team coverage">
      <div className="capacity-panel-header">
        <h3>Daily coverage</h3>
        <span className="capacity-muted">Equivalent available members, after allocation</span>
      </div>
      <ul className="capacity-calendar">
        {days.map((day) => (
          <CapacityCalendarDay key={day.date} day={day} memberCount={memberCount} />
        ))}
      </ul>
      {totalCount > 35 && (
        <button type="button" onClick={onToggle}>
          {expanded ? "Show less" : "Show full calendar"}
        </button>
      )}
    </section>
  );
}
