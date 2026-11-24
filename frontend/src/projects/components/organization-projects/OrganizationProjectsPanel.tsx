import type { ReactNode } from "react";

export function OrganizationProjectsPanel({ children }: { children: ReactNode }) {
  return (
    <section className="project-directory-section" aria-labelledby="organization-projects-title">
      {children}
    </section>
  );
}
