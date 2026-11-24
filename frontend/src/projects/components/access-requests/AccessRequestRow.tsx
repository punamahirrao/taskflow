import type { ProjectAccessRequest } from "../../api/projects";
import { AccessRequestDetails } from "./AccessRequestDetails";
import { AccessRequestActions } from "./AccessRequestActions";

export function AccessRequestRow({
  item,
  busyId,
  onReview,
}: {
  item: ProjectAccessRequest;
  busyId: number | null;
  onReview: (item: ProjectAccessRequest, decision: "approved" | "declined") => Promise<void>;
}) {
  return (
    <div className="project-request-row">
      <AccessRequestDetails item={item} />
      <AccessRequestActions item={item} busyId={busyId} onReview={onReview} />
    </div>
  );
}
