import { ChevronLeft, ChevronRight } from "lucide-react";
import type { useCalendarPageModel } from "../../features/month/useCalendarPageModel";

export function CalendarMonthNavigation({
  model,
}: {
  model: ReturnType<typeof useCalendarPageModel>;
}) {
  const { label, move } = model;
  return (
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
  );
}
