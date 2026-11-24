import type { Sprint } from "../../../features/tasks/entities/task";
import type { SprintCapacity } from "../../entities/capacity";
import { shownCapacityPoints as shown } from "../../utils/capacityFormat";
import { CapacityMetricsGrid } from "../../components/capacity-summary/CapacityMetricsGrid";
import { CapacityMetricCard } from "../../components/capacity-summary/CapacityMetricCard";
import { CapacityUnassignedNotice } from "../../components/capacity-summary/CapacityUnassignedNotice";
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
  const over = summary.headroom_points !== null && summary.headroom_points < 0;
  return (
    <>
      <CapacityMetricsGrid>
        <CapacityMetricCard
          label="Team members"
          value={summary.member_count}
          caption="Project contributors"
        />
        <CapacityMetricCard
          label="Available capacity"
          value={shown(summary.configured_members ? summary.combined_points : null)}
          caption={unset ? `${unset} point budgets not set` : "Adjusted for availability"}
        />
        <CapacityMetricCard
          label="Planned sprint work"
          value={`${summary.planned_points} pts`}
          caption={`Sprint target: ${shown(sprint.capacity_points)}`}
        />
        <CapacityMetricCard
          label={over ? "Over capacity" : "Headroom"}
          strongClassName={over ? "capacity-danger" : "capacity-positive"}
          value={shown(summary.headroom_points === null ? null : Math.abs(summary.headroom_points))}
          caption={
            summary.all_configured ? "Compared with planned work" : "Set all budgets to forecast"
          }
        />
      </CapacityMetricsGrid>
      {(summary.unassigned_points > 0 || summary.outside_team_points > 0) && (
        <CapacityUnassignedNotice
          unassigned={summary.unassigned_points}
          outsideTeam={summary.outside_team_points}
          onReviewStories={onReviewStories}
        />
      )}
    </>
  );
}
