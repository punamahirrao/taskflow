import type { useCalendarPageModel } from "../../features/month/useCalendarPageModel";
import { CalendarDay } from "./CalendarDay";
function iso(day: Date) {
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}
export function CalendarMonthGrid({ model }: { model: ReturnType<typeof useCalendarPageModel> }) {
  const { month, events, cells } = model;
  return (
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
        return <CalendarDay key={key} day={day} month={month} events={events} dateKey={key} />;
      })}
    </div>
  );
}
