import { FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../../../common/entities/project";
export function WorkProjectItem({
  project,
  open,
  completed,
}: {
  project: Project;
  open: number;
  completed: number;
}) {
  return (
    <li>
      <FolderKanban size={20} className="my-work-list-icon" />
      <Link className="my-work-item-link" to={`/project/${project.id}`}>
        {project.name}
        <small>Your role: {project.my_role ?? "Member"}</small>
      </Link>
      <span className="my-work-muted">
        {open} open · {completed} completed
      </span>
    </li>
  );
}
