import { GitBranch } from "lucide-react";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapUnscheduledNotice({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { plan } = model;
  return (
    <p className="roadmap-notice">
      <GitBranch size={15} />
      {plan.externalCount} dependencies are outside this view. Include all work items to see more
      connections. Cross-project predecessors remain in the feature details.
    </p>
  );
}
