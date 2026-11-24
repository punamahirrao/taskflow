import type { ProjectDirectoryEntry } from "../../api/projects";
import { OrganizationProjectFrame } from "../../components/organization-projects/OrganizationProjectFrame";
import { OrganizationProjectSummary } from "../../components/organization-projects/OrganizationProjectSummary";
import { OrganizationProjectMeta } from "../../components/organization-projects/OrganizationProjectMeta";
import { OrganizationProjectFooter } from "../../components/organization-projects/OrganizationProjectFooter";
import { OrganizationProjectAction } from "../../components/organization-projects/OrganizationProjectAction";

export function OrganizationProjectCard({
  project,
  onRequest,
  onOpen,
}: {
  project: ProjectDirectoryEntry;
  onRequest: () => void;
  onOpen: () => void;
}) {
  const status = project.status ?? "in_progress";
  return (
    <OrganizationProjectFrame name={project.name}>
      <OrganizationProjectSummary name={project.name} description={project.description} />
      <OrganizationProjectMeta status={status} endDate={project.end_date} />
      <OrganizationProjectFooter owner={project.owner_details}>
        <OrganizationProjectAction
          name={project.name}
          hasAccess={project.has_access}
          pending={project.access_request_status === "pending"}
          onOpen={onOpen}
          onRequest={onRequest}
        />
      </OrganizationProjectFooter>
    </OrganizationProjectFrame>
  );
}
