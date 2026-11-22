import { AuthFieldInput, AuthFieldLabel } from "./Auth.styles";

interface AuthFieldProps {
  id: string;
  testId: string;
  labelTestId?: string;
  label: string;
  type: "email" | "text" | "password";
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
}

export function AuthField({
  id,
  testId,
  labelTestId,
  label,
  type,
  autoComplete,
  value,
  onChange,
  required,
  maxLength,
}: AuthFieldProps) {
  return (
    <AuthFieldLabel data-testid={labelTestId ?? `${testId}-label`} htmlFor={id}>
      {label}
      <AuthFieldInput
        id={id}
        data-testid={testId}
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </AuthFieldLabel>
  );
}
