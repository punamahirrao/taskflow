import type { ReactNode } from "react";

export function OrganizationProjectsGrid({ children }: { children: ReactNode }) {
  return <div className="project-directory-grid">{children}</div>;
}
