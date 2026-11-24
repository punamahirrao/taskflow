import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";

export function PlanningDescriptionField({
  model,
}: {
  model: ReturnType<typeof usePlanningFormModel>;
}) {
  const { values, setValues } = model;
  return (
    <label className="block text-sm">
      Description
      <textarea
        value={values.description}
        onChange={(event) => setValues({ ...values, description: event.target.value })}
        rows={4}
        className="mt-1 w-full rounded border border-line bg-canvas p-2"
      />
    </label>
  );
}
