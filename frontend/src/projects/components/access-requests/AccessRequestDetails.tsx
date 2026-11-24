import Avatar from "../../../common/components/Avatar";
import type { ProjectAccessRequest } from "../../api/projects";

export function AccessRequestDetails({ item }: { item: ProjectAccessRequest }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Avatar name={item.requester.name} photoUrl={item.requester.photo_url} size={28} />
        <strong>{item.requester.name}</strong>
      </div>
      <p>
        {item.project_name} · {item.requested_role === "member" ? "Member" : "Viewer"} access
      </p>
      <p>{item.reason}</p>
    </div>
  );
}
