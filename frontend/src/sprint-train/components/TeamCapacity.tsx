import type { FormEvent } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import Avatar from "../../common/components/Avatar";
import type { Sprint } from "../../features/tasks/entities/task";
import { formatDate } from "../utils/sprintTrain";
import AvailabilityForm from "./AvailabilityForm";
import { CapacityLayout } from "./TeamCapacity.styles";
import { SprintPlanningDetails } from "./SprintPlanningDetails";
import { CapacitySummary } from "./CapacitySummary";
import { useSprintCapacity } from "../hooks/useSprintCapacity";
const shown = (value: number | null) => (value === null ? "—" : `${value} pts`);

function CapacityReport({
  sprint,
  onSprintUpdated,
  onReviewStories,
}: {
  sprint: Sprint;
  onSprintUpdated: (sprint: Sprint) => void;
  onReviewStories: () => void;
}) {
  const capacity = useSprintCapacity(sprint, onSprintUpdated);
  const {
    data,
    draft,
    setDraft,
    dirty,
    setDirty,
    busy,
    error,
    notice,
    form,
    setForm,
    expanded,
    setExpanded,
  } = capacity;

  if (!data)
    return (
      <div className="capacity-panel">
        {error ? (
          <>
            <p role="alert" className="capacity-danger">
              {error}
            </p>
            <button onClick={capacity.retry}>Retry</button>
          </>
        ) : (
          <p role="status">Loading team availability…</p>
        )}
      </div>
    );
  const summary = data.summary;
  const canLog = data.members.some((member) => member.can_log_absence);
  const memberName = (id: number) =>
    data.members.find((member) => member.id === id)?.name ?? "Team member";
  const savePlan = async (event: FormEvent) => {
    event.preventDefault();
    await capacity.savePlan();
  };
  const saveAvailability = async (input: Parameters<typeof capacity.saveAvailability>[0]) => {
    await capacity.saveAvailability(input);
  };
  const applyForecast = capacity.applyForecast;
  const removeEntry = capacity.removeEntry;
  return (
    <>
      <div className="capacity-panel">
        <div className="capacity-panel-header">
          <div>
            <h3>{sprint.name}</h3>
            <SprintPlanningDetails
              sprint={sprint}
              canEdit={data.can_manage}
              onSaved={onSprintUpdated}
            />
          </div>
          {data.can_manage && (
            <button
              className="capacity-primary"
              disabled={
                busy ||
                dirty ||
                summary.suggested_capacity_points === null ||
                sprint.capacity_points === summary.suggested_capacity_points
              }
              onClick={() => void applyForecast()}
            >
              Use forecast for sprint
            </button>
          )}
        </div>
        <p className="capacity-muted" style={{ marginTop: ".65rem" }}>
          {data.working_days} weekdays · {data.holiday_days} holiday days ·{" "}
          {summary.members_with_time_off} members with time off. Weekends are excluded.
        </p>
      </div>
      {error && (
        <p className="capacity-notice capacity-danger" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="capacity-notice" role="status">
          {notice}
        </p>
      )}
      {!data.has_dates && (
        <p className="capacity-notice">
          <CalendarDays size={16} aria-hidden="true" />
          Set sprint start and end dates to calculate availability.
        </p>
      )}
      <CapacitySummary data={data} sprint={sprint} onReviewStories={onReviewStories} />
      <form className="capacity-panel" onSubmit={(event) => void savePlan(event)}>
        <div className="capacity-panel-header">
          <h3>People & availability</h3>
          {data.can_manage && (
            <button
              type="submit"
              className="capacity-primary"
              disabled={busy || !dirty || !data.members.length}
            >
              {busy ? "Saving…" : "Save team plan"}
            </button>
          )}
        </div>
        <p className="capacity-muted">
          Full-sprint points × available weekdays ÷ sprint weekdays × allocation. Point budgets are
          entered by the team.
        </p>
        {dirty && (
          <p className="capacity-warning" role="status">
            Unsaved budgets — save the team plan to update the forecast.
          </p>
        )}
        {data.members.length ? (
          <div
            className="capacity-table-wrap"
            role="region"
            aria-label="Team member capacity"
            tabIndex={0}
          >
            <table>
              <caption>
                Budgets apply to this sprint. Holidays and absences are shared across this project’s
                sprints.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Availability</th>
                  <th scope="col">Full-sprint points</th>
                  <th scope="col">Allocation</th>
                  <th scope="col">Can take</th>
                  <th scope="col">Planned</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="capacity-person">
                        <Avatar name={member.name} photoUrl={member.photo_url} size={32} />
                        <div>
                          <strong>{member.name}</strong>
                          <small>
                            {member.job_title || member.role}
                            {member.removal_date
                              ? ` · Ends ${formatDate(member.removal_date)}`
                              : ""}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="capacity-availability">
                        <span>
                          {member.available_days ?? "—"} / {data.working_days} days
                        </span>
                        <progress
                          max={data.working_days || 1}
                          value={member.available_days ?? 0}
                          aria-label={`${member.name} available weekdays`}
                        />
                        <small className="capacity-muted">
                          {member.absence_days ? `${member.absence_days} days off` : "No time off"}
                        </small>
                      </div>
                    </td>
                    <td>
                      {data.can_manage ? (
                        <input
                          type="number"
                          aria-label={`Full-sprint points for ${member.name}`}
                          value={draft[member.id]?.points ?? ""}
                          min={0}
                          max={1000}
                          step={0.1}
                          placeholder="Not set"
                          disabled={busy}
                          onChange={(event) => {
                            setDraft((current) => ({
                              ...current,
                              [member.id]: { ...current[member.id], points: event.target.value },
                            }));
                            setDirty(true);
                          }}
                        />
                      ) : (
                        (member.baseline_points ?? "Not set")
                      )}
                    </td>
                    <td>
                      {data.can_manage ? (
                        <input
                          type="number"
                          aria-label={`Allocation percent for ${member.name}`}
                          value={draft[member.id]?.allocation ?? "100"}
                          min={0}
                          max={100}
                          required
                          disabled={busy}
                          onChange={(event) => {
                            setDraft((current) => ({
                              ...current,
                              [member.id]: {
                                ...current[member.id],
                                allocation: event.target.value,
                              },
                            }));
                            setDirty(true);
                          }}
                        />
                      ) : (
                        `${member.allocation_percent}%`
                      )}
                    </td>
                    <td>
                      <strong>{shown(member.available_points)}</strong>
                    </td>
                    <td
                      className={
                        member.available_points !== null &&
                        member.assigned_points > member.available_points
                          ? "capacity-danger"
                          : ""
                      }
                    >
                      {member.assigned_points} pts
                      {member.available_points !== null &&
                        member.assigned_points > member.available_points && (
                          <small style={{ display: "block" }}>
                            Over by{" "}
                            {Math.round((member.assigned_points - member.available_points) * 10) /
                              10}
                          </small>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="capacity-empty">
            Add project contributors to plan team capacity. View-only members are excluded.
          </p>
        )}
      </form>
      {data.calendar.length > 0 && (
        <section className="capacity-panel" aria-label="Daily team coverage">
          <div className="capacity-panel-header">
            <h3>Daily coverage</h3>
            <span className="capacity-muted">Equivalent available members, after allocation</span>
          </div>
          <ul className="capacity-calendar">
            {data.calendar.slice(0, expanded.calendar ? undefined : 35).map((day) => (
              <li
                key={day.date}
                data-state={
                  day.weekend || day.holidays.length
                    ? "off"
                    : day.available_members === 0
                      ? "gap"
                      : day.available_members < summary.member_count
                        ? "reduced"
                        : "full"
                }
                title={`${formatDate(day.date)} · ${day.holidays.join(", ") || (day.weekend ? "Weekend" : `${day.available_members} available members`)}`}
              >
                <span>
                  {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                  })}
                </span>
                <strong>
                  {day.weekend ? "—" : day.holidays.length ? "Holiday" : day.available_members}
                </strong>
              </li>
            ))}
          </ul>
          {data.calendar.length > 35 && (
            <button
              type="button"
              onClick={() =>
                setExpanded((current) => ({ ...current, calendar: !current.calendar }))
              }
            >
              {expanded.calendar ? "Show less" : "Show full calendar"}
            </button>
          )}
        </section>
      )}
      <div className="capacity-log-grid">
        <section className="capacity-panel" aria-label="Time off logs">
          <div className="capacity-panel-header">
            <h3>
              Time off <span className="capacity-muted">{data.absences.length}</span>
            </h3>
            {canLog && (
              <button
                disabled={busy || !data.has_dates}
                onClick={() => setForm(form === "absence" ? null : "absence")}
              >
                <Plus size={14} aria-hidden="true" />
                Log absence
              </button>
            )}
          </div>
          {form === "absence" && (
            <AvailabilityForm
              kind="absence"
              members={data.members.filter((member) => member.can_log_absence)}
              start={sprint.start_date ?? ""}
              end={sprint.end_date ?? ""}
              busy={busy}
              onSave={saveAvailability}
              onCancel={() => setForm(null)}
            />
          )}
          <ul className="capacity-log-list">
            {data.absences.slice(0, expanded.absences ? undefined : 4).map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{memberName(entry.user_id)}</strong> ·{" "}
                  {entry.kind === "vacation" ? "Vacation" : "Absence"}
                  <small>
                    {formatDate(entry.start_date)} – {formatDate(entry.end_date)}
                    {entry.day_fraction === 0.5 ? " · Half day each day" : ""}
                  </small>
                  {entry.note && <small>{entry.note}</small>}
                </div>
                {entry.can_delete && (
                  <button
                    disabled={busy}
                    aria-label={`Remove ${entry.kind} for ${memberName(entry.user_id)}`}
                    onClick={() => void removeEntry("absences", entry.id)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {!data.absences.length && (
            <p className="capacity-empty">No time off logged for this sprint.</p>
          )}
          {data.absences.length > 4 && (
            <button
              onClick={() =>
                setExpanded((current) => ({ ...current, absences: !current.absences }))
              }
            >
              {expanded.absences ? "Show less" : `Show all ${data.absences.length}`}
            </button>
          )}
        </section>
        <section className="capacity-panel" aria-label="Team holidays">
          <div className="capacity-panel-header">
            <h3>
              Team holidays <span className="capacity-muted">{data.holidays.length}</span>
            </h3>
            {data.can_manage && (
              <button
                disabled={busy || !data.has_dates}
                onClick={() => setForm(form === "holiday" ? null : "holiday")}
              >
                <Plus size={14} aria-hidden="true" />
                Log holiday
              </button>
            )}
          </div>
          {form === "holiday" && (
            <AvailabilityForm
              kind="holiday"
              members={[]}
              start={sprint.start_date ?? ""}
              end={sprint.end_date ?? ""}
              busy={busy}
              onSave={saveAvailability}
              onCancel={() => setForm(null)}
            />
          )}
          <ul className="capacity-log-list">
            {data.holidays.slice(0, expanded.holidays ? undefined : 4).map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{entry.name}</strong>
                  <small>
                    {formatDate(entry.start_date)} – {formatDate(entry.end_date)}
                  </small>
                </div>
                {entry.can_delete && (
                  <button
                    disabled={busy}
                    aria-label={`Remove holiday ${entry.name}`}
                    onClick={() => void removeEntry("holidays", entry.id)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {!data.holidays.length && (
            <p className="capacity-empty">No team holidays in this sprint.</p>
          )}
          {data.holidays.length > 4 && (
            <button
              onClick={() =>
                setExpanded((current) => ({ ...current, holidays: !current.holidays }))
              }
            >
              {expanded.holidays ? "Show less" : `Show all ${data.holidays.length}`}
            </button>
          )}
        </section>
      </div>
      <p className="capacity-muted">
        Planning forecast, not a performance score. Overlapping absences and holidays are counted
        once. “Use forecast” rounds down to whole sprint points.
      </p>
    </>
  );
}

export default function TeamCapacity({
  sprints,
  selectedSprint,
  onSelectSprint,
  onSprintUpdated,
  onReviewStories,
}: {
  sprints: Sprint[];
  selectedSprint: Sprint | null;
  onSelectSprint: (id: number) => void;
  onSprintUpdated: (sprint: Sprint) => void;
  onReviewStories: () => void;
}) {
  return (
    <CapacityLayout aria-label="Team capacity planning">
      <header className="capacity-heading">
        <h2>Team capacity</h2>
        <label>
          Sprint
          <select
            value={selectedSprint?.id ?? ""}
            onChange={(event) => onSelectSprint(Number(event.target.value))}
            disabled={!sprints.length}
          >
            {!sprints.length && <option value="">No sprints</option>}
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      {selectedSprint ? (
        <CapacityReport
          key={`${selectedSprint.id}:${selectedSprint.start_date}:${selectedSprint.end_date}`}
          sprint={selectedSprint}
          onSprintUpdated={onSprintUpdated}
          onReviewStories={onReviewStories}
        />
      ) : (
        <div className="capacity-panel">
          <p>Create a sprint to start planning availability.</p>
        </div>
      )}
    </CapacityLayout>
  );
}
