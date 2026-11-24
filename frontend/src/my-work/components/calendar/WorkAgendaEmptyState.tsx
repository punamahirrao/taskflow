import { CalendarDays } from "lucide-react";
export function WorkAgendaEmptyState({ full }: { full?: boolean }) {
  return (
    <div className="my-work-agenda-empty">
      <CalendarDays size={22} />
      <p>{full ? "No assigned deadlines on this date." : "No assigned deadlines in this week."}</p>
    </div>
  );
}
