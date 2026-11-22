import Avatar from "../../common/components/Avatar";
import type { ProjectOwner as Owner } from "../../common/entities/project";

export function ProjectOwner({ owner }: { owner?: Owner | null }) {
  return (
    <div className="project-owner">
      <Avatar name={owner?.name ?? "Unassigned owner"} photoUrl={owner?.photo_url} size={28} />
      <div>
        <small>Owner</small>
        <span title={owner?.name}>{owner?.name ?? "Unassigned"}</span>
      </div>
    </div>
  );
}
