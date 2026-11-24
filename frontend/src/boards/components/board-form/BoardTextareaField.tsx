import { fieldClass, type TextareaProps } from "./fieldTypes";

export function BoardTextareaField({ id, label, testId, className = "", ...props }: TextareaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        data-testid={`${testId}-label`}
        className="block text-sm font-medium text-content"
      >
        {label}
      </label>
      <textarea
        id={id}
        data-testid={`${testId}-input`}
        className={`${fieldClass} ${className}`}
        {...props}
      />
    </div>
  );
}
