import type { ReactNode } from "react";
import { useAutomaticTestIds } from "../hooks/useAutomaticTestIds";

interface AutomaticTestIdsProps {
  children: ReactNode;
}

export function AutomaticTestIds({ children }: AutomaticTestIdsProps) {
  useAutomaticTestIds();
  return children;
}
