import { apiFetch } from "../../common/api/client";
import type { TeamMemberProfile } from "../../common/entities/user";

export const getTeamMemberProfile = (userId: number) =>
  apiFetch<TeamMemberProfile>(`/accounts/users/${userId}/team-profile/`);
