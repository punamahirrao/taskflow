import { RegisterFieldInput, RegisterFieldLabel } from "../Register.styles";

interface RegisterFieldProps {
  id: string;
  testId: string;
  label: string;
  type: "email" | "text" | "password";
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
}

export default function RegisterField({ id, testId, label, type, autoComplete, value, onChange, required, maxLength }: RegisterFieldProps) {
  return (
    <RegisterFieldLabel data-testid={`${testId}-label`} htmlFor={id}>
      {label}
      <RegisterFieldInput
        id={id}
        data-testid={testId}
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </RegisterFieldLabel>
  );
}
