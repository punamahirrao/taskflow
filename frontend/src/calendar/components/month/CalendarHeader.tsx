import type { useCalendarPageModel } from "../../features/month/useCalendarPageModel";
import { CalendarMonthNavigation } from "./CalendarMonthNavigation";

export function CalendarHeader({ model }: { model: ReturnType<typeof useCalendarPageModel> }) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="mt-2 text-sm text-muted">
          Task deadlines, sprint dates and organization delivery targets.
        </p>
      </div>
      <CalendarMonthNavigation model={model} />
    </header>
  );
}
