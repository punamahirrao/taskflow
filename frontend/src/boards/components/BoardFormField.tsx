import type { ComponentPropsWithoutRef } from "react";

interface BaseProps {
  id: string;
  label: string;
  testId: string;
}
type InputProps = BaseProps & Omit<ComponentPropsWithoutRef<"input">, "id">;
type TextareaProps = BaseProps & Omit<ComponentPropsWithoutRef<"textarea">, "id">;
type SelectProps = BaseProps & Omit<ComponentPropsWithoutRef<"select">, "id">;
const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

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
