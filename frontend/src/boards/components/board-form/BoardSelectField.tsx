import { fieldClass, type SelectProps } from "./fieldTypes";

export function BoardSelectField({ id, label, testId, className = "", ...props }: SelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-content"
      >
        {label}
      </label>
      <select
        id={id}
        data-testid={`${testId}-input`}
        className={`${fieldClass} ${className}`}
        {...props}
      />
    </div>
  );
}
