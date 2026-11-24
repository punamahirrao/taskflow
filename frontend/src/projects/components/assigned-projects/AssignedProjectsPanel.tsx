import type { ReactNode } from "react";

export function AssignedProjectsPanel({ children }: { children: ReactNode }) {
  return (
    <section className="project-directory-section" aria-labelledby="assigned-projects-title">
      {children}
    </section>
  );
}
