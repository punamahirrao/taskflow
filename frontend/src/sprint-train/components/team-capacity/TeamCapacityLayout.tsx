import type { ReactNode } from "react";
import { CapacityLayout } from "./TeamCapacity.styles";

export function TeamCapacityLayout({ children }: { children: ReactNode }) {
  return <CapacityLayout aria-label="Team capacity planning">{children}</CapacityLayout>;
}
