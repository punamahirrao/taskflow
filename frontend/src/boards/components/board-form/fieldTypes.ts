import type { ComponentPropsWithoutRef } from "react";

interface BaseProps {
  id: string;
  label: string;
  testId: string;
}
export type InputProps = BaseProps & Omit<ComponentPropsWithoutRef<"input">, "id">;
export type TextareaProps = BaseProps & Omit<ComponentPropsWithoutRef<"textarea">, "id">;
export type SelectProps = BaseProps & Omit<ComponentPropsWithoutRef<"select">, "id">;
export const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";
