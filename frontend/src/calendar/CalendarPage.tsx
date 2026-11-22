import { PaddedPage } from "../common/components/styled";

import { useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Link } from "react-router-dom";

import { dataScope } from "../common/api/queryApi";
import { useCalendarQuery } from "./api/calendarQuery";

import { useProjectContext } from "../common/features/projects/context/useProjectContext";

function iso(day: Date) {
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const { selectedId } = useProjectContext();

  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const start = iso(month),
    end = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const {
    currentData: events = [],
    isFetching,
    error,
    refetch,
  } = useCalendarQuery({ ...dataScope(selectedId), start, end });

  const offset = (month.getDay() + 6) % 7;

  const cells = Array.from(
    {
      length:
        Math.ceil((offset + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7) *
        7,
    },
    (_, index) => new Date(month.getFullYear(), month.getMonth(), index - offset + 1),
  );

  const label = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const move = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <PaddedPage>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="mt-2 text-sm text-muted">
            Task deadlines, sprint dates and organization delivery targets.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Previous month" onClick={() => move(-1)}>
            <ChevronLeft />
          </button>
          <h2 className="min-w-40 text-center font-semibold" aria-live="polite">
            {label}
          </h2>
          <button type="button" aria-label="Next month" onClick={() => move(1)}>
            <ChevronRight />
          </button>
        </div>
      </header>

      {error && (
        <p role="alert">
          Could not load calendar.{" "}
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </p>
      )}
      {isFetching && <p role="status">Loading calendar…</p>}

      <div className="overflow-x-auto rounded-xl border border-line">
        <div className="grid min-w-[700px] grid-cols-7 gap-px bg-line">
          {Array.from({ length: 7 }, (_, index) =>
            new Date(2024, 0, index + 1).toLocaleDateString(undefined, { weekday: "short" }),
          ).map((day) => (
            <div key={day} className="bg-subtle p-3 text-center text-xs font-semibold">
              {day}
            </div>
          ))}
          {cells.map((day) => {
            const key = iso(day);
            return (
              <div
                key={key}
                className={`min-h-28 bg-surface p-2 ${day.getMonth() !== month.getMonth() ? "opacity-50" : ""}`}
              >
                <time dateTime={key} className="text-xs text-muted">
                  {day.getDate()}
                </time>
                {events
                  .filter((event) => event.date === key)
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
          })}
        </div>
      </div>

      {!isFetching && !error && !events.length && (
        <p className="mt-4 text-sm text-muted">No deadlines or delivery targets this month.</p>
      )}
    </PaddedPage>
  );
}
