import type { ChangeEvent, MouseEvent } from "react";

interface FieldBaseProps {
  id: string;
  label: string;
  testId: string;
}

interface TextFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  onClick?: (event: MouseEvent<HTMLInputElement>) => void;
  className: string;
}

export function EstimatorTextField({
  id,
  label,
  testId,
  value,
  onChange,
  onClick,
  className,
}: TextFieldProps) {
  return (
    <>
      <label htmlFor={id} data-testid={`${testId}-label`} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        data-testid={`${testId}-input`}
        aria-label={label}
        value={value}
        onClick={onClick}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      />
    </>
  );
}

interface TextAreaFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  rows: number;
  className: string;
}

export function EstimatorTextAreaField({
  id,
  label,
  testId,
  value,
  onChange,
  rows,
  className,
}: TextAreaFieldProps) {
  return (
    <>
      <label htmlFor={id} data-testid={`${testId}-label`} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        data-testid={`${testId}-input`}
        aria-label={label}
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        rows={rows}
        className={className}
      />
    </>
  );
}

interface NumberFieldProps extends FieldBaseProps {
  value: number;
  onChange: (value: number) => void;
  className: string;
  wrapperClassName: string;
  suffix: string;
}

export function EstimatorNumberField({
  id,
  label,
  testId,
  value,
  onChange,
  className,
  wrapperClassName,
  suffix,
}: NumberFieldProps) {
  return (
    <label htmlFor={id} data-testid={`${testId}-label`} className={wrapperClassName}>
      <input
        id={id}
        data-testid={`${testId}-input`}
        aria-label={label}
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value)))}
        className={className}
      />
      {suffix}
    </label>
  );
}

interface RadioFieldProps extends FieldBaseProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function EstimatorRadioField({
  id,
  label,
  testId,
  name,
  checked,
  onChange,
  className,
}: RadioFieldProps) {
  return (
    <>
      <label htmlFor={id} data-testid={`${testId}-label`} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        data-testid={`${testId}-input`}
        type="radio"
        aria-label={label}
        name={name}
        checked={checked}
        onChange={onChange}
        className={className}
      />
    </>
  );
}
