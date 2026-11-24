import { Check } from "lucide-react";
import { stepLabels } from "../../utils/releaseDisplay";
import { ReleaseApprovalHeader } from "./ReleaseApprovalHeader";

import type { useReleaseDetailsModel } from "../../features/release-details/useReleaseDetailsModel";
export function ReleaseApprovalFlow({
  model,
}: {
  model: ReturnType<typeof useReleaseDetailsModel>;
}) {
  const {
    result,
    note,
    setNote,
    error,
    reassignId,
    setReassignId,
    assignee,
    setAssignee,
    active,
    canEdit,
    act,
    release,
    members,
    canManage,
  } = model;
  return (
    <section className="release-panel" aria-labelledby="approval-flow-title">
      <ReleaseApprovalHeader model={model} />
      <div className="release-detail-body">
        {!release.steps.length && (
          <p className="release-muted">
            No approval steps configured.{canEdit ? " Edit the release to assign approvers." : ""}
          </p>
        )}
        {release.state === "ready" && (
          <p className="release-notice">
            All approvals are complete. An organization administrator can mark the release done.
          </p>
        )}
        <ol className="release-timeline">
          {release.steps.map((step, index) => (
            <li key={step.id} className={step.id === active?.id ? "active" : ""}>
              <span className="release-step-number" aria-hidden="true">
                {step.status === "approved" ? <Check size={15} /> : index + 1}
              </span>
              <div className="release-step-body">
                <div className="release-step-header">
                  <div>
                    <h3>{step.name}</h3>
                    <p className="release-muted">{step.approver_name ?? "Approver needed"}</p>
                  </div>
                  <span className={`release-badge ${step.status}`}>{stepLabels[step.status]}</span>
                </div>
                {step.note && <p className="release-note">{step.note}</p>}
                {step.decided_at && (
                  <time className="release-muted" dateTime={step.decided_at}>
                    Last decision {new Date(step.decided_at).toLocaleDateString()}
                  </time>
                )}
                {step.can_decide && (
                  <div className="release-review">
                    <label>
                      Review note
                      <textarea
                        rows={2}
                        maxLength={2000}
                        value={note}
                        placeholder="Required when requesting changes"
                        onChange={(event) => setNote(event.target.value)}
                      />
                    </label>
                    <div className="release-actions">
                      <button
                        type="button"
                        className="release-button"
                        disabled={result.isLoading || !note.trim()}
                        onClick={() =>
                          void act({ action: "request_changes", step_id: step.id, note })
                        }
                      >
                        Request changes
                      </button>
                      <button
                        type="button"
                        className="release-button primary"
                        disabled={result.isLoading}
                        onClick={() => void act({ action: "approve", step_id: step.id, note })}
                      >
                        <Check size={16} /> Approve
                      </button>
                    </div>
                  </div>
                )}
                {canManage && step.id === active?.id && step.status === "changes_requested" && (
                  <button
                    type="button"
                    className="release-button"
                    disabled={result.isLoading}
                    onClick={() => void act({ action: "resume", step_id: step.id })}
                  >
                    Send back for review
                  </button>
                )}
                {canManage &&
                  release.state !== "done" &&
                  release.state !== "planned" &&
                  step.status !== "approved" &&
                  (reassignId === step.id ? (
                    <div className="release-actions release-reassign">
                      <select
                        aria-label={`New approver for ${step.name}`}
                        value={assignee || ""}
                        onChange={(event) => setAssignee(Number(event.target.value))}
                      >
                        <option value="">Choose an approver</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="release-button"
                        disabled={!assignee || result.isLoading}
                        onClick={() =>
                          void act({
                            action: "reassign",
                            step_id: step.id,
                            approver_id: assignee,
                          })
                        }
                      >
                        Save approver
                      </button>
                      <button
                        type="button"
                        className="release-link"
                        onClick={() => setReassignId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="release-link release-reassign"
                      onClick={() => {
                        setReassignId(step.id);
                        setAssignee(step.approver_id ?? 0);
                      }}
                    >
                      Reassign approver
                    </button>
                  ))}
              </div>
            </li>
          ))}
        </ol>
        {error && (
          <p role="alert" className="release-error">
            {error}
          </p>
        )}
        {result.isLoading && (
          <p role="status" className="release-muted">
            Saving review…
          </p>
        )}
      </div>
    </section>
  );
}
