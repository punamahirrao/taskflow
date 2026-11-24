import { Clock } from "lucide-react";
import type { ProjectOwner as Owner } from "../../../common/entities/project";
import type { ProjectTimeLeft } from "../../entities/projects";
import { ProjectCardFooter, ProjectCardDue } from "../../Projects.styles";
import { ProjectOwner } from "../ProjectOwner";

export function AssignedProjectFooter({
  owner,
  due,
}: {
  owner: Owner | null;
  due: ProjectTimeLeft;
}) {
  return (
    <ProjectCardFooter>
      <ProjectOwner owner={owner} />
      <ProjectCardDue $urgent={due.urgent}>
        <Clock size={14} aria-hidden="true" />
        {due.label}
      </ProjectCardDue>
    </ProjectCardFooter>
  );
}
