import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Task } from "../../features/tasks/entities/task";
import { dateKey, displayDate, shiftDays } from "../utils/workDates";

export function WorkAgenda({
  tasks,
  full,
  onTask,
  onView,
}: {
  tasks: Task[];
  full?: boolean;
  onTask: (task: Task) => void;
  onView: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const start = shiftDays(today, offset * 7);
  const days = Array.from({ length: 7 }, (_, index) => shiftDays(start, index));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selected = selectedDate ?? dateKey(start);
  const active = tasks.filter((task) => task.status !== "done" && task.due_date);
  const items = active.filter((task) =>
    full
      ? task.due_date === selected
      : task.due_date! >= dateKey(start) && task.due_date! <= dateKey(days[6]),
  );
  items.sort((a, b) => a.due_date!.localeCompare(b.due_date!) || a.title.localeCompare(b.title));

  const navigate = (week: number) => {
    setOffset(week);
    setSelectedDate(null);
  };

  return (
    <section className="my-work-panel">
      <header className="my-work-panel-heading">
        <h2>My Calendar</h2>
        {!full && (
          <button className="my-work-link" onClick={onView}>
            View calendar →
          </button>
        )}
      </header>
      <div className="my-work-agenda-toolbar">
        <strong>
          {displayDate(dateKey(start))} – {displayDate(dateKey(days[6]))}
        </strong>
        <div className="my-work-actions">
          <button
            type="button"
            className="my-work-icon-button"
            aria-label="Previous week"
            onClick={() => navigate(offset - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <button type="button" className="my-work-button compact" onClick={() => navigate(0)}>
            Today
          </button>
          <button
            type="button"
            className="my-work-icon-button"
            aria-label="Next week"
            onClick={() => navigate(offset + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {full && (
        <div className="my-work-week" aria-label="Days in this week">
          {days.map((day) => {
            const key = dateKey(day);
            const count = active.filter((task) => task.due_date === key).length;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={key === selected}
                onClick={() => setSelectedDate(key)}
              >
                <span>{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <b>{day.getDate()}</b>
                <small>{count ? `${count} due` : "–"}</small>
              </button>
            );
          })}
        </div>
      )}
      {items.length ? (
        <ul className="my-work-list">
          {items.slice(0, full ? items.length : 5).map((task) => (
            <li key={task.id}>
              <span className={`my-work-dot ${task.priority}`} />
              <time dateTime={task.due_date!}>{displayDate(task.due_date!)}</time>
              <button type="button" className="my-work-item-link" onClick={() => onTask(task)}>
                {task.title}
                <small>{task.project_name}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="my-work-agenda-empty">
          <CalendarDays size={22} />
          <p>
            {full ? "No assigned deadlines on this date." : "No assigned deadlines in this week."}
          </p>
        </div>
      )}
    </section>
  );
}
