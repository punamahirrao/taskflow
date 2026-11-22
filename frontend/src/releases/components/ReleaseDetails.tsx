import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Check, ClipboardCheck, Target } from "lucide-react";
import { useChangeReleaseMutation } from "../api/releases";
import type { Approver, Release, ReleaseAction } from "../entities/release";
import { formatDate, releaseLabels, stepLabels } from "../utils/releaseDisplay";

export function ReleaseDetails({
  release,
  members,
  canManage,
  onEdit,
}: {
  release: Release;
  members: Approver[];
  canManage: boolean;
  onEdit: () => void;
}) {
  const [change, result] = useChangeReleaseMutation();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [reassignId, setReassignId] = useState<number | null>(null);
  const [assignee, setAssignee] = useState(0);
  const [showTasks, setShowTasks] = useState(false);
  const done = release.tasks.filter((task) => task.status === "done").length;
  const approved = release.steps.filter((step) => step.status === "approved").length;
  const active = release.steps.find((step) => step.id === release.active_step_id);
  const canEdit =
    canManage &&
    (release.state === "planned" || (release.state === "in_progress" && !release.steps.length));

  async function act(input: ReleaseAction) {
    if (result.isLoading) return;
    setError("");
    try {
      await change({ id: release.id, input }).unwrap();
      setNote("");
      setReassignId(null);
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not update the release.",
      );
    }
  }

  return (
    <div className="release-stack">
      <section className="release-panel" aria-labelledby="release-title">
        <header className="release-panel-heading">
          <div>
            <span className={`release-badge ${release.state}`}>{releaseLabels[release.state]}</span>
            <h2 id="release-title" className="mt-2">
              {release.name}
            </h2>
          </div>
          {canEdit && (
            <button className="release-button" type="button" onClick={onEdit}>
              Edit release
            </button>
          )}
        </header>
        <div className="release-detail-body">
          <p className="release-date">
            <CalendarDays size={17} />
            {formatDate(release.target_date)}
          </p>
          {release.description && (
            <p className="whitespace-pre-wrap text-sm">{release.description}</p>
          )}
          <div className="release-links">
            <h3>
              <Target size={17} /> Linked goals
            </h3>
            {release.goals.length ? (
              <ul>
                {release.goals.map((goal) => (
                  <li key={goal.id}>
                    <Link to={`/goals?goal=${goal.id}`}>
                      {goal.name}
                      <ArrowUpRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="release-muted">No goals linked.</p>
            )}
          </div>
          <div className="release-task-summary">
            <div>
              <h3>Work item progress</h3>
              <span>
                {done} of {release.tasks.length} complete
              </span>
            </div>
            <progress
              max={Math.max(release.tasks.length, 1)}
              value={done}
              aria-label="Linked work items complete"
            />
            {release.tasks.length > 0 && (
              <button
                type="button"
                aria-expanded={showTasks}
                className="release-link"
                onClick={() => setShowTasks(!showTasks)}
              >
                {showTasks ? "Hide linked work" : "Show linked work"}
              </button>
            )}
          </div>
          {showTasks && (
            <ul className="release-task-list">
              {release.tasks.map((task) => (
                <li key={task.id}>
                  <Link to={`/project/${task.project_id}`}>
                    {task.title}
                    <small>{task.project_name}</small>
                  </Link>
                  <span className={`release-badge ${task.status === "done" ? "done" : "planned"}`}>
                    {task.status.replaceAll("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="release-panel" aria-labelledby="approval-flow-title">
        <header className="release-panel-heading">
          <div>
            <h2 id="approval-flow-title">
              <ClipboardCheck size={20} /> Approval flow
            </h2>
            <p className="release-muted">
              {approved} of {release.steps.length} steps approved
            </p>
          </div>
          {canManage && release.state === "planned" && !!release.steps.length && (
            <button
              type="button"
              className="release-button primary"
              disabled={result.isLoading}
              onClick={() => void act({ action: "start" })}
            >
              Start review
            </button>
          )}
          {canManage && release.state === "ready" && (
            <button
              type="button"
              className="release-button primary"
              disabled={result.isLoading}
              onClick={() => void act({ action: "finish" })}
            >
              <Check size={16} /> Mark done
            </button>
          )}
        </header>
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
                    <span className={`release-badge ${step.status}`}>
                      {stepLabels[step.status]}
                    </span>
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
    </div>
  );
}
