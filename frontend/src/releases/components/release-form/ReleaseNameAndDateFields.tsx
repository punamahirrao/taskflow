import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
export function ReleaseNameAndDateFields({
  model,
}: {
  model: ReturnType<typeof useReleaseFormModel>;
}) {
  const { values, setValues } = model;
  return (
    <div className="release-form-row">
      <label>
        Release name
        <input
          autoFocus
          required
          maxLength={160}
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
        />
      </label>
      <label>
        Target date
        <input
          type="date"
          value={values.target_date ?? ""}
          onChange={(event) => setValues({ ...values, target_date: event.target.value || null })}
        />
      </label>
    </div>
  );
}
