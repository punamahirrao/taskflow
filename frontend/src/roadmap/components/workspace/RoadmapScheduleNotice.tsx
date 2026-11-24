import { TriangleAlert } from "lucide-react";

import type { useRoadmapWorkspaceModel } from "../../features/workspace/useRoadmapWorkspaceModel";
export function RoadmapScheduleNotice({
  model,
}: {
  model: ReturnType<typeof useRoadmapWorkspaceModel>;
}) {
  const { plan } = model;
  return (
    <p className="roadmap-notice warning">
      <TriangleAlert size={15} />
      {plan.conflicts} dependency overlap{plan.conflicts === 1 ? "" : "s"}: a successor starts
      before its predecessor is expected to finish. Dates are kept as planned.
    </p>
  );
}
