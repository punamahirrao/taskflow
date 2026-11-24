import type { ReactNode } from "react";
import { ProjectCardFrame, ProjectCardSurface } from "../../Projects.styles";

export function AssignedProjectCardLayout({
  children,
  defaultAction,
}: {
  children: ReactNode;
  defaultAction: ReactNode;
}) {
  return (
    <ProjectCardFrame>
      <ProjectCardSurface>{children}</ProjectCardSurface>
      {defaultAction}
    </ProjectCardFrame>
  );
}
