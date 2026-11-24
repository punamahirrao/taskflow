import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";

export function PlanningNameField({ model }: { model: ReturnType<typeof usePlanningFormModel> }) {
  const { values, setValues, kind } = model;
  return (
    <label className="block text-sm">
      Name
      <input
        autoFocus
        required
        maxLength={160}
        placeholder={kind === "milestone" ? "e.g. Beta launch readiness" : undefined}
        value={values.name}
        onChange={(event) => setValues({ ...values, name: event.target.value })}
        className="mt-1 w-full rounded border border-line bg-canvas p-2"
      />
    </label>
  );
}
