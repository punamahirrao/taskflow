import type { ProjectMember } from "../../common/entities/project";
import type { SiteUser } from "../../common/entities/user";

export interface ProjectMemberRow extends ProjectMember {
  user: SiteUser;
}
