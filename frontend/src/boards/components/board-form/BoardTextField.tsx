import { fieldClass, type InputProps } from "./fieldTypes";

export function BoardTextField({ id, label, testId, className = "", ...props }: InputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-content"
      >
        {label}
      </label>
      <input
        id={id}
        data-testid={`${testId}-input`}
        className={`${fieldClass} ${className}`}
        {...props}
      />
    </div>
  );
}
