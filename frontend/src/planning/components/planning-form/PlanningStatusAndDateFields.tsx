import type { PlanningRecord } from "../../entities/planning";
import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";

export function PlanningStatusAndDateFields({
  model,
}: {
  model: ReturnType<typeof usePlanningFormModel>;
}) {
  const { values, setValues } = model;
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className="text-sm">
        Status
        <select
          value={values.status}
          onChange={(event) =>
            setValues({ ...values, status: event.target.value as PlanningRecord["status"] })
          }
          className="mt-1 w-full rounded border border-line bg-canvas p-2"
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </label>
      <label className="text-sm">
        Target date
        <input
          type="date"
          value={values.target_date ?? ""}
          onChange={(event) => setValues({ ...values, target_date: event.target.value || null })}
          className="mt-1 w-full rounded border border-line bg-canvas p-2"
        />
      </label>
    </div>
  );
}
