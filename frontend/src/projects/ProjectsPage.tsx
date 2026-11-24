import { ProjectsPageLayout } from "./components/layout/ProjectsPageLayout";
import { ProjectsLoadingState } from "./components/layout/ProjectsLoadingState";
import { ProjectsError } from "./components/layout/ProjectsError";
import { ProjectDirectoryToolbar } from "./features/directory-toolbar/ProjectDirectoryToolbar";
import { AssignedProjects } from "./features/assigned-projects/AssignedProjects";
import { OrganizationProjects } from "./features/organization-projects/OrganizationProjects";
import { AccessRequestInbox } from "./features/access-requests/AccessRequestInbox";
import CreateProjectDialog from "./features/create-project/CreateProjectDialog";
import { RequestAccessDialog } from "./features/request-access/RequestAccessDialog";
import { useProjectsPage } from "./features/hooks/useProjectsPage";

export default function ProjectsPage() {
  const page = useProjectsPage();
  return (
    <ProjectsPageLayout>
      <ProjectDirectoryToolbar {...page.toolbarProps} />
      <AccessRequestInbox onReviewed={page.refreshProjects} />
      {page.loading && <ProjectsLoadingState />}
      {page.error && <ProjectsError message={page.error} />}
      {page.actionError && <ProjectsError message={page.actionError} />}
      <AssignedProjects {...page.assignedProps} />
      <OrganizationProjects {...page.organizationProps} />
      {page.createProps && <CreateProjectDialog {...page.createProps} />}
      {page.requestProps && <RequestAccessDialog {...page.requestProps} />}
    </ProjectsPageLayout>
  );
}
