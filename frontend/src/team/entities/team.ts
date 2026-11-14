import type { ProjectMember } from "../../common/entities/project";

export interface TeamRosterProject {
  id: number;
  name: string;
}

export interface TeamRosterMember extends ProjectMember {
  projects: TeamRosterProject[];
  roles: string[];
  can_view_profile: boolean;
}
