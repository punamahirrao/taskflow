import type { ReactNode } from "react";
import { useAutomaticTestIds } from "../hooks/useAutomaticTestIds";

export function AutomaticTestIds({ children }: { children: ReactNode }) {
  useAutomaticTestIds();
  return children;
}
