import { CircleHelp } from "lucide-react";

export function RoadmapPermissionsNotice() {
  return (
    <p className="roadmap-notice">
      <CircleHelp size={15} />
      You have read-only access to this project’s roadmap.
    </p>
  );
}
