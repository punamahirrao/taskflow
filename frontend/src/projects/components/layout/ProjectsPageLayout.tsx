import type { ReactNode } from "react";
import { ProjectDirectoryStyles } from "../../Projects.styles";

export function ProjectsPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="project-directory" data-testid="page-projects">
      <ProjectDirectoryStyles />
      {children}
    </main>
  );
}
