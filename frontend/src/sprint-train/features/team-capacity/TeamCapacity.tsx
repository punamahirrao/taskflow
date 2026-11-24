import type { TeamCapacityProps } from "../../entities/capacityPlanning";
import { TeamCapacityLayout } from "../../components/team-capacity/TeamCapacityLayout";
import { TeamCapacityHeader } from "../../components/team-capacity/TeamCapacityHeader";
import { TeamCapacityEmptyState } from "../../components/team-capacity/TeamCapacityEmptyState";
import { CapacityReport } from "./CapacityReport";
export default function TeamCapacity({
  sprints,
  selectedSprint,
  onSelectSprint,
  onSprintUpdated,
  onReviewStories,
}: TeamCapacityProps) {
  return (
    <TeamCapacityLayout>
      <TeamCapacityHeader
        sprints={sprints}
        selectedSprint={selectedSprint}
        onSelectSprint={onSelectSprint}
      />
      {selectedSprint ? (
        <CapacityReport
          key={`${selectedSprint.id}:${selectedSprint.start_date}:${selectedSprint.end_date}`}
          sprint={selectedSprint}
          onSprintUpdated={onSprintUpdated}
          onReviewStories={onReviewStories}
        />
      ) : (
        <TeamCapacityEmptyState />
      )}
    </TeamCapacityLayout>
  );
}
