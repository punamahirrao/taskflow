import { Link } from "react-router-dom";
import type { CalendarItem } from "../../api/calendarQuery";
export function CalendarDay({
  day,
  month,
  events,
  dateKey,
}: {
  day: Date;
  month: Date;
  events: CalendarItem[];
  dateKey: string;
}) {
  return (
    <div
      className={`min-h-28 bg-surface p-2 ${day.getMonth() !== month.getMonth() ? "opacity-50" : ""}`}
    >
      <time dateTime={dateKey} className="text-xs text-muted">
        {day.getDate()}
      </time>
      {events
        .filter((event) => event.date === dateKey)
        .map((event) => (
          <Link
            key={event.id}
            to={
              event.project_id
                ? `/project/${event.project_id}`
                : event.kind === "release"
                  ? "/releases"
                  : event.kind === "goal"
                    ? "/goals"
                    : "/planning/milestones"
            }
            className={`mt-1 block rounded px-2 py-1 text-xs ${event.kind === "task" ? "bg-violet-100 text-violet-800" : event.kind === "sprint" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}
          >
            {event.title}
          </Link>
        ))}
    </div>
  );
}
