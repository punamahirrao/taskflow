import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { CreateProjectLabel, CreateProjectSelect } from "../../Projects.styles";

interface ProjectStatusFieldProps {
  value: Project["status"];
  onChange: (value: Project["status"]) => void;
}

export default function ProjectStatusField({ value, onChange }: ProjectStatusFieldProps) {
  const { t } = useTranslation();

  return (
    <CreateProjectLabel data-testid="project-status-label">
      {t("projects.statusLabel")}
      <CreateProjectSelect
        data-testid="project-status-select"
        value={value}
        onChange={(event) => onChange(event.target.value as Project["status"])}
      >
        <option value="in_progress">{t("projects.statusInProgress")}</option>
        <option value="upcoming">{t("projects.statusUpcoming")}</option>
        <option value="archived">{t("projects.statusArchived")}</option>
      </CreateProjectSelect>
    </CreateProjectLabel>
  );
}
