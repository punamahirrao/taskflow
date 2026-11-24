import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { CalendarDays, Pencil } from "lucide-react";
import type { Sprint } from "../../../features/tasks/entities/task";
import { formatDate } from "../../utils/sprintTrain";

export function SprintPlanningSummary({
  sprint,
  canEdit,
  onEdit,
}: {
  sprint: Sprint;
  canEdit: boolean;
  onEdit: (field: "goal" | "dates") => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="sprint-planning-summary">
      <button type="button" disabled={!canEdit} onClick={() => onEdit("goal")}>
        {sprint.goal && <span className="sr-only">{t("sprintTrain.editSprintGoal")}: </span>}
        <Pencil size={13} aria-hidden="true" />
        <span>{sprint.goal || t("sprintTrain.addSprintGoal")}</span>
      </button>
      <button type="button" disabled={!canEdit} onClick={() => onEdit("dates")}>
        <span className="sr-only">{t("sprintTrain.editSprintDates")}: </span>
        <CalendarDays size={14} aria-hidden="true" />
        <span>
          {sprint.start_date ? formatDate(sprint.start_date) : t("sprintTrain.startDate")} –{" "}
          {sprint.end_date ? formatDate(sprint.end_date) : t("sprintTrain.endDate")}
        </span>
      </button>
    </div>
  );
}
