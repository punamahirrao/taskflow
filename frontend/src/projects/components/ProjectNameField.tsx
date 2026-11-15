import {
  CreateProjectField,
  CreateProjectInput,
  CreateProjectLabel,
} from "../Projects.styles";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface ProjectNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProjectNameField({ value, onChange }: ProjectNameFieldProps) {
  const { t } = useTranslation();

  return (
    <CreateProjectField>
      <CreateProjectLabel data-testid="project-name-label" htmlFor="project-name">
        {t("projects.dialog.projectName")}
      </CreateProjectLabel>
      <CreateProjectInput
        data-testid="project-name-input"
        id="project-name"
        type="text"
        autoFocus
        placeholder={t("projects.dialog.projectNamePlaceholder")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </CreateProjectField>
  );
}
