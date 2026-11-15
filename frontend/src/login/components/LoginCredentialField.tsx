import { AuthFieldInput, AuthFieldLabel } from "../Login.styles";

interface LoginCredentialFieldProps {
  id: string;
  testId: string;
  labelTestId?: string;
  label: string;
  type: "email" | "password";
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}

export default function LoginCredentialField({ id, testId, labelTestId, label, type, autoComplete, value, onChange }: LoginCredentialFieldProps) {
  return (
    <AuthFieldLabel data-testid={labelTestId ?? `${testId}-label`} htmlFor={id}>
      {label}
      <AuthFieldInput
        id={id}
        data-testid={testId}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </AuthFieldLabel>
  );
}
