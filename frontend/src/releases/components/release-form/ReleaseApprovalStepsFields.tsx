import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
export function ReleaseApprovalStepsFields({
  model,
}: {
  model: ReturnType<typeof useReleaseFormModel>;
}) {
  const { values, setValues, moveStep, editStep, members } = model;
  return (
    <fieldset>
      <legend>Approval flow</legend>
      <p className="release-muted">
        Each approver reviews the release in order. Save a draft now or configure the steps before
        starting review.
      </p>
      {values.steps.map((step, index) => (
        <div key={index} className="release-step-input">
          <label>
            Step {index + 1}
            <input
              required
              maxLength={100}
              value={step.name}
              placeholder="e.g. Quality sign-off"
              onChange={(event) => editStep(index, { name: event.target.value })}
            />
          </label>
          <label>
            Approver for step {index + 1}
            <select
              required
              value={step.approver_id || ""}
              onChange={(event) => editStep(index, { approver_id: Number(event.target.value) })}
            >
              <option value="">Choose an approver</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <div className="release-actions">
            <button
              type="button"
              className="release-icon"
              aria-label={`Move step ${index + 1} up`}
              disabled={!index}
              onClick={() => moveStep(index, -1)}
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              className="release-icon"
              aria-label={`Move step ${index + 1} down`}
              disabled={index + 1 === values.steps.length}
              onClick={() => moveStep(index, 1)}
            >
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              className="release-icon"
              aria-label={`Remove step ${index + 1}`}
              onClick={() =>
                setValues({
                  ...values,
                  steps: values.steps.filter((_, position) => position !== index),
                })
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="release-button"
        disabled={!members.length || values.steps.length >= 20}
        onClick={() =>
          setValues({ ...values, steps: [...values.steps, { name: "", approver_id: 0 }] })
        }
      >
        <Plus size={16} /> Add approval step
      </button>
    </fieldset>
  );
}
