import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { ProjectCardStatus } from "../../Projects.styles";

export function ProjectStatusBadge({ status }: { status: Project["status"] }) {
  const { t } = useTranslation();
  return (
    <ProjectCardStatus $status={status}>
      {t(
        status === "archived"
          ? "projects.statusArchived"
          : status === "upcoming"
            ? "projects.statusUpcoming"
            : "projects.statusInProgress",
      )}
    </ProjectCardStatus>
  );
}
