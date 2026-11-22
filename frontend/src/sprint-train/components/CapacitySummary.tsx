import type { Sprint } from "../../features/tasks/entities/task";
import type { SprintCapacity } from "../entities/capacity";

const shown = (value: number | null) => (value === null ? "—" : `${value} pts`);

export function CapacitySummary({
  data,
  sprint,
  onReviewStories,
}: {
  data: SprintCapacity;
  sprint: Sprint;
  onReviewStories: () => void;
}) {
  const summary = data.summary;
  const unset = summary.member_count - summary.configured_members;
  return (
    <>
      <div className="capacity-metrics">
        <div className="capacity-metric">
          <span className="capacity-muted">Team members</span>
          <strong>{summary.member_count}</strong>
          <span className="capacity-muted">Project contributors</span>
        </div>
        <div className="capacity-metric">
          <span className="capacity-muted">Available capacity</span>
          <strong>{shown(summary.configured_members ? summary.combined_points : null)}</strong>
          <span className="capacity-muted">
            {unset ? `${unset} point budgets not set` : "Adjusted for availability"}
          </span>
        </div>
        <div className="capacity-metric">
          <span className="capacity-muted">Planned sprint work</span>
          <strong>{summary.planned_points} pts</strong>
          <span className="capacity-muted">Sprint target: {shown(sprint.capacity_points)}</span>
        </div>
        <div className="capacity-metric">
          <span className="capacity-muted">
            {summary.headroom_points !== null && summary.headroom_points < 0
              ? "Over capacity"
              : "Headroom"}
          </span>
          <strong
            className={
              summary.headroom_points !== null && summary.headroom_points < 0
                ? "capacity-danger"
                : "capacity-positive"
            }
          >
            {shown(summary.headroom_points === null ? null : Math.abs(summary.headroom_points))}
          </strong>
          <span className="capacity-muted">
            {summary.all_configured ? "Compared with planned work" : "Set all budgets to forecast"}
          </span>
        </div>
      </div>
      {(summary.unassigned_points > 0 || summary.outside_team_points > 0) && (
        <div className="capacity-notice">
          <span>
            {summary.unassigned_points} pts unassigned
            {summary.outside_team_points > 0
              ? ` · ${summary.outside_team_points} pts assigned outside this team`
              : ""}
          </span>
          <button onClick={onReviewStories}>Review sprint stories</button>
        </div>
      )}
    </>
  );
}
