import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "../../common/entities/project";
import type { Task } from "../../features/tasks/entities/task";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

export function ProjectTimelineCalendar({ project, tasks }: { project: Project; tasks: Task[] }) {
  const { t } = useTranslation();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - ((firstDay.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks)
    if (task.due_date)
      tasksByDate.set(task.due_date, [...(tasksByDate.get(task.due_date) ?? []), task]);
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(new Date(2024, 0, 1 + index)),
  );

  return (
    <section className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(month)}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t("projectTimeline.hint")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t("projectTimeline.previousMonth")}
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="rounded-lg border px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {t("projectTimeline.today")}
          </button>
          <button
            type="button"
            aria-label={t("projectTimeline.nextMonth")}
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </header>
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {weekdays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="px-2 py-2 text-center text-xs font-semibold text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const key = dateKey(date);
          const isCurrentMonth = date.getMonth() === month.getMonth();
          const isToday = key === dateKey(new Date());
          const isStart = project.expected_start_date === key;
          const isEnd = project.end_date === key;
          return (
            <div
              key={key}
              className={`min-h-24 border-b border-r border-slate-100 p-1.5 ${isCurrentMonth ? "bg-white" : "bg-slate-50/60"}`}
            >
              <span
                className={`inline-grid size-6 place-items-center rounded-full text-xs ${isToday ? "bg-violet-600 font-bold text-white" : isCurrentMonth ? "text-slate-700" : "text-slate-300"}`}
              >
                {date.getDate()}
              </span>
              {isStart && (
                <p className="mt-1 truncate rounded bg-emerald-50 px-1.5 py-1 text-[calc(10px*var(--taskflow-font-scale,1))] font-medium text-emerald-700">
                  {t("projectTimeline.projectStart")}
                </p>
              )}
              {isEnd && (
                <p className="mt-1 truncate rounded bg-amber-50 px-1.5 py-1 text-[calc(10px*var(--taskflow-font-scale,1))] font-medium text-amber-700">
                  {t("projectTimeline.projectEnd")}
                </p>
              )}
              {(tasksByDate.get(key) ?? []).slice(0, 2).map((task) => (
                <p
                  key={task.id}
                  title={task.title}
                  className="mt-1 truncate rounded bg-violet-50 px-1.5 py-1 text-[calc(10px*var(--taskflow-font-scale,1))] text-violet-700"
                >
                  {task.title}
                </p>
              ))}
              {(tasksByDate.get(key)?.length ?? 0) > 2 && (
                <p className="px-1 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-500">
                  +{tasksByDate.get(key)!.length - 2}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
