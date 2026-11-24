import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function AssignedProjectsEmptyState({
  hasAssignedProjects,
}: {
  hasAssignedProjects: boolean;
}) {
  const { t } = useTranslation();
  return (
    <p className="project-directory-empty">
      {hasAssignedProjects ? t("projects.noMatch") : "No projects are assigned to you yet."}
    </p>
  );
}
