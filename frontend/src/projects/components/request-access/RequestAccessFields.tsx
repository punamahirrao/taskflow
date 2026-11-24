import type { ReactNode } from "react";
import { CreateProjectFields } from "../../Projects.styles";

export function RequestAccessFields({ children }: { children: ReactNode }) {
  return <CreateProjectFields className="mt-4">{children}</CreateProjectFields>;
}
