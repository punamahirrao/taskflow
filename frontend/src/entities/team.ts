import type { ProjectMember } from "./project";

export type TeamRosterMember = ProjectMember & {
  projects: { id: number; name: string }[];
  roles: string[];
  can_view_profile: boolean;
};
