import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { CreateProjectField, CreateProjectInput, CreateProjectLabel } from "../../Projects.styles";

interface ProjectDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProjectDescriptionField({ value, onChange }: ProjectDescriptionFieldProps) {
  const { t } = useTranslation();

  return (
    <CreateProjectField>
      <CreateProjectLabel data-testid="project-description-label" htmlFor="project-description">
        {t("projects.dialog.description")}
      </CreateProjectLabel>
      <CreateProjectInput
        data-testid="project-description-input"
        id="project-description"
        type="text"
        placeholder={t("projects.dialog.descriptionPlaceholder")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </CreateProjectField>
  );
}
