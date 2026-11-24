import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import {
  ProjectCardHeading,
  ProjectCardAvatar,
  ProjectCardHeadingContent,
  ProjectCardDefaultBadge,
} from "../../Projects.styles";
import { ProjectStatusBadge } from "../shared/ProjectStatusBadge";

export function AssignedProjectHeading({
  name,
  initial,
  status,
  isDefault,
}: {
  name: string;
  initial: string;
  status: Project["status"];
  isDefault: boolean;
}) {
  const { t } = useTranslation();
  return (
    <ProjectCardHeading>
      <ProjectCardAvatar aria-hidden="true">{initial}</ProjectCardAvatar>
      <ProjectCardHeadingContent>
        <h3 className="truncate text-sm font-semibold">{name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <ProjectStatusBadge status={status} />
          {isDefault && (
            <ProjectCardDefaultBadge>{t("projects.card.default")}</ProjectCardDefaultBadge>
          )}
        </div>
      </ProjectCardHeadingContent>
    </ProjectCardHeading>
  );
}
