import type { ReactNode } from "react";
import type { ProjectOwner as Owner } from "../../../common/entities/project";
import { ProjectOwner } from "../ProjectOwner";

export function OrganizationProjectFooter({
  owner,
  children,
}: {
  owner?: Owner | null;
  children: ReactNode;
}) {
  return (
    <div className="organization-project-footer">
      <ProjectOwner owner={owner} />
      {children}
    </div>
  );
}
