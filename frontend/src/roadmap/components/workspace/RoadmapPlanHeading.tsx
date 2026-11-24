import { CalendarDays, Plus } from "lucide-react";
import { shortDate } from "../../utils/roadmapModel";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapPlanHeading({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { loading, canWrite, plan, addFeature } = model;
  return (
    <div className="roadmap-plan-heading">
      <div>
        <p className="roadmap-eyebrow">FROM IDEA TO DELIVERY</p>
        <h2>Feature roadmap</h2>
        <p>Keep features, dependencies and expected delivery weeks in sync.</p>
      </div>
      <div className="roadmap-plan-actions">
        <span className="roadmap-date-range">
          <CalendarDays size={15} />
          {plan.startDate
            ? `${shortDate(plan.startDate)} – ${shortDate(plan.endDate)}`
            : "No dates planned"}
        </span>
        <button
          type="button"
          className="roadmap-button primary"
          disabled={!canWrite || loading}
          onClick={() => addFeature()}
        >
          <Plus size={15} />
          Add feature
        </button>
      </div>
    </div>
  );
}
