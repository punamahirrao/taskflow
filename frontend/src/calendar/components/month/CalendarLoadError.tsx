import type { useCalendarPageModel } from "../../features/month/useCalendarPageModel";

export function CalendarLoadError({ model }: { model: ReturnType<typeof useCalendarPageModel> }) {
  const { refetch } = model;
  return (
    <p role="alert">
      Could not load calendar.{" "}
      <button type="button" onClick={() => void refetch()}>
        Try again
      </button>
    </p>
  );
}
