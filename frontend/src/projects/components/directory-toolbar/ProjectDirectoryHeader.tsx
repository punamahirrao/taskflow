import type { ReactNode } from "react";

export function ProjectDirectoryHeader({ children }: { children: ReactNode }) {
  return (
    <header className="project-directory-header">
      <h1>Projects</h1>
      <div className="project-directory-tools">{children}</div>
    </header>
  );
}
