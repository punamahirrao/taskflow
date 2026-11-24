import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import {
  ProjectCardProgressSection,
  ProjectCardProgressLabel,
  ProjectCardProgressName,
  ProjectCardProgressValue,
  ProjectCardProgressTrack,
  ProjectCardProgressFill,
} from "../../Projects.styles";

export function AssignedProjectProgress({ name, progress }: { name: string; progress: number }) {
  const { t } = useTranslation();
  return (
    <ProjectCardProgressSection>
      <ProjectCardProgressLabel>
        <ProjectCardProgressName>{t("projects.card.progress")}</ProjectCardProgressName>
        <ProjectCardProgressValue>{progress}%</ProjectCardProgressValue>
      </ProjectCardProgressLabel>
      <ProjectCardProgressTrack
        role="progressbar"
        aria-label={t("projects.card.progressAria", { name })}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <ProjectCardProgressFill style={{ width: `${progress}%` }} />
      </ProjectCardProgressTrack>
    </ProjectCardProgressSection>
  );
}
