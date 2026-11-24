import { TriangleAlert } from "lucide-react";

export function RoadmapCycleNotice() {
  return (
    <p role="alert" className="roadmap-notice warning">
      <TriangleAlert size={15} />A dependency cycle exists in this plan. Edit dependencies to
      restore a valid delivery sequence.
    </p>
  );
}
