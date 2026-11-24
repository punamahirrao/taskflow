import { CalendarDays } from "lucide-react";

export function CapacityDatesNotice() {
  return (
    <p className="capacity-notice">
      <CalendarDays size={16} aria-hidden="true" />
      Set sprint start and end dates to calculate availability.
    </p>
  );
}
