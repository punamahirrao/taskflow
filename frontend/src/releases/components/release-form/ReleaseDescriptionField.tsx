import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
export function ReleaseDescriptionField({
  model,
}: {
  model: ReturnType<typeof useReleaseFormModel>;
}) {
  const { values, setValues } = model;
  return (
    <label>
      Description
      <textarea
        rows={2}
        value={values.description}
        maxLength={10000}
        onChange={(event) => setValues({ ...values, description: event.target.value })}
      />
    </label>
  );
}
