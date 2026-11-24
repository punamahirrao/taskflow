import type { useCalendarPageModel } from "../../features/month/useCalendarPageModel";
import { CalendarMonthGrid } from "./CalendarMonthGrid";

export function CalendarGridViewport({
  model,
}: {
  model: ReturnType<typeof useCalendarPageModel>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <CalendarMonthGrid model={model} />
    </div>
  );
}
