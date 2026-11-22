import { useState, type FormEvent } from "react";
import { CalendarDays, Pencil } from "lucide-react";
import type { Sprint } from "../../features/tasks/entities/task";
import { updateSprint } from "../../features/tasks/api/sprints";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { formatDate } from "../utils/sprintTrain";

export function SprintPlanningDetails({
  sprint,
  canEdit,
  onSaved,
}: {
  sprint: Sprint;
  canEdit: boolean;
  onSaved: (sprint: Sprint) => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<"goal" | "dates" | null>(null);
  const [goal, setGoal] = useState(sprint.goal);
  const [start, setStart] = useState(sprint.start_date ?? "");
  const [end, setEnd] = useState(sprint.end_date ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function open(field: "goal" | "dates") {
    setGoal(sprint.goal);
    setStart(sprint.start_date ?? "");
    setEnd(sprint.end_date ?? "");
    setError("");
    setEditing(field);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (start && end && end < start) {
      setError("End date must be on or after the start date.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await updateSprint(sprint.id, {
        goal: goal.trim(),
        start_date: start || null,
        end_date: end || null,
      });
      onSaved(saved);
      setEditing(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save sprint details. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sprint-planning-details">
      {editing ? (
        <form className="sprint-planning-form" onSubmit={(event) => void save(event)}>
          <label>
            {t("sprintTrain.sprintGoal")}
            <textarea
              rows={2}
              value={goal}
              disabled={busy}
              autoFocus={editing === "goal"}
              onChange={(event) => setGoal(event.target.value)}
            />
          </label>
          <div className="sprint-planning-dates">
            <label>
              {t("sprintTrain.startDate")}
              <input
                type="date"
                value={start}
                disabled={busy}
                autoFocus={editing === "dates"}
                onChange={(event) => setStart(event.target.value)}
              />
            </label>
            <label>
              {t("sprintTrain.endDate")}
              <input
                type="date"
                value={end}
                min={start || undefined}
                disabled={busy}
                onChange={(event) => setEnd(event.target.value)}
              />
            </label>
          </div>
          {error && (
            <p className="text-danger" role="alert">
              {error}
            </p>
          )}
          <div className="sprint-planning-actions">
            <button type="button" disabled={busy} onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={busy} aria-label={t("sprintTrain.saveSprintDetails")}>
              {t(busy ? "common.saving" : "common.save")}
            </button>
          </div>
        </form>
      ) : (
        <div className="sprint-planning-summary">
          <button type="button" disabled={!canEdit} onClick={() => open("goal")}>
            {sprint.goal && <span className="sr-only">{t("sprintTrain.editSprintGoal")}: </span>}
            <Pencil size={13} aria-hidden="true" />
            <span>{sprint.goal || t("sprintTrain.addSprintGoal")}</span>
          </button>
          <button type="button" disabled={!canEdit} onClick={() => open("dates")}>
            <span className="sr-only">{t("sprintTrain.editSprintDates")}: </span>
            <CalendarDays size={14} aria-hidden="true" />
            <span>
              {sprint.start_date ? formatDate(sprint.start_date) : t("sprintTrain.startDate")} –{" "}
              {sprint.end_date ? formatDate(sprint.end_date) : t("sprintTrain.endDate")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
