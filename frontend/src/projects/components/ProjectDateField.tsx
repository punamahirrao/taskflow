import type { TranslationKey } from "../../common/entities/language";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { CreateProjectField, CreateProjectInput, CreateProjectLabel } from "../Projects.styles";

interface ProjectDateFieldProps {
  id: string;
  testId: string;
  inputTestId: string;
  label: TranslationKey;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}

export default function ProjectDateField({ id, testId, inputTestId, label, value, onChange, min }: ProjectDateFieldProps) {
  const { t } = useTranslation();

  return (
    <CreateProjectField>
      <CreateProjectLabel data-testid={testId} htmlFor={id}>{t(label)}</CreateProjectLabel>
      <CreateProjectInput
        data-testid={inputTestId}
        id={id}
        type="date"
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </CreateProjectField>
  );
}
