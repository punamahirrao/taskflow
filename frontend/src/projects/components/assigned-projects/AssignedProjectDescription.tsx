import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { ProjectCardDescription } from "../../Projects.styles";

export function AssignedProjectDescription({ description }: { description: string }) {
  const { t } = useTranslation();
  return (
    <ProjectCardDescription>
      {description || t("projects.card.noDescription")}
    </ProjectCardDescription>
  );
}
