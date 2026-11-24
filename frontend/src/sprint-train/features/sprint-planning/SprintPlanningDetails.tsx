import { useState } from "react";
import type { Sprint } from "../../../features/tasks/entities/task";
import { updateSprint } from "../../../features/tasks/api/sprints";
import { SprintPlanningLayout } from "../../components/sprint-planning/SprintPlanningLayout";
import { SprintPlanningSummary } from "../../components/sprint-planning/SprintPlanningSummary";
import { SprintPlanningForm } from "../../components/sprint-planning/SprintPlanningForm";
import { SprintPlanningGoalField } from "../../components/sprint-planning/SprintPlanningGoalField";
import { SprintPlanningDateFields } from "../../components/sprint-planning/SprintPlanningDateFields";
import { SprintPlanningError } from "../../components/sprint-planning/SprintPlanningError";
import { SprintPlanningActions } from "../../components/sprint-planning/SprintPlanningActions";

export function SprintPlanningDetails({
  sprint,
  canEdit,
  onSaved,
}: {
  sprint: Sprint;
  canEdit: boolean;
  onSaved: (sprint: Sprint) => void;
}) {
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

  async function save() {
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
    <SprintPlanningLayout>
      {editing ? (
        <SprintPlanningForm onSave={save}>
          <SprintPlanningGoalField
            goal={goal}
            busy={busy}
            autoFocus={editing === "goal"}
            onChange={setGoal}
          />
          <SprintPlanningDateFields
            start={start}
            end={end}
            busy={busy}
            autoFocus={editing === "dates"}
            onStart={setStart}
            onEnd={setEnd}
          />
          {error && <SprintPlanningError error={error} />}
          <SprintPlanningActions busy={busy} onCancel={() => setEditing(null)} />
        </SprintPlanningForm>
      ) : (
        <SprintPlanningSummary sprint={sprint} canEdit={canEdit} onEdit={open} />
      )}
    </SprintPlanningLayout>
  );
}
