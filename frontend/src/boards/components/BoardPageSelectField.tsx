import type { ChangeEvent, ReactNode } from "react";

interface Props {
  id: string;
  label: string;
  value: string;
  testId: string;
  onChange: (value: string) => void;
  children: ReactNode;
}
export function BoardPageSelectField({ id, label, value, testId, onChange, children }: Props) {
  return (
    <label
      htmlFor={id}
      data-testid={`${testId}-label`}
      className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted"
    >
      {label}
      <select
        id={id}
        data-testid={`${testId}-input`}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium normal-case tracking-normal text-content"
      >
        {children}
      </select>
    </label>
  );
}
