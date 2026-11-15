import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { TranslationKey } from "../../common/entities/language";
import { ProfileFieldInput, ProfileFieldLabel, ProfileFieldTextArea } from "../Profile.styles";

interface ProfileFieldProps {
  id: string;
  labelId: string;
  inputId: string;
  label: TranslationKey;
  value: string;
  onChange?: (value: string) => void;
  type?: "text" | "password" | "email" | "textarea";
  readOnly?: boolean;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  rows?: number;
  placeholder?: string;
}

export default function ProfileField({ id, labelId, inputId, label, value, onChange, type = "text", readOnly, required, maxLength, autoComplete, rows, placeholder }: ProfileFieldProps) {
  const { t } = useTranslation();
  const fieldLabel = t(label);

  return (
    <>
      <ProfileFieldLabel data-testid={labelId} htmlFor={id}>{fieldLabel}</ProfileFieldLabel>
      {type === "textarea"
        ? <ProfileFieldTextArea
            id={id}
            data-testid={inputId}
            value={value}
            maxLength={maxLength}
            rows={rows}
            placeholder={placeholder}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          />
        : <ProfileFieldInput
            id={id}
            data-testid={inputId}
            value={value}
            type={type}
            readOnly={readOnly}
            aria-readonly={readOnly || undefined}
            required={required}
            maxLength={maxLength}
            autoComplete={autoComplete}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          />}
    </>
  );
}
