import { CalendarDays } from "lucide-react";
import type { Sprint } from "../../../features/tasks/entities/task";
import { formatDate } from "../../utils/sprintTrain";

export function SprintPipelineCardDates({ sprint }: { sprint: Sprint }) {
  return (
    <>
      <p className="mt-2 flex items-center gap-1.5 text-[calc(11px*var(--taskflow-font-scale,1))] text-slate-500">
        <CalendarDays size={12} />
        {formatDate(sprint.start_date)} – {formatDate(sprint.end_date)}
      </p>
      {sprint.goal && (
        <p className="mt-1 line-clamp-1 text-[calc(11px*var(--taskflow-font-scale,1))] text-slate-600">
          {sprint.goal}
        </p>
      )}
    </>
  );
}
