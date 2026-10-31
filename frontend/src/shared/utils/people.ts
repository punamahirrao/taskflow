import type { ProjectMember } from "../../entities/project";

type PersonName = Pick<ProjectMember, "first_name" | "last_name" | "email">;

export const memberName = (member: PersonName) =>
  `${member.first_name} ${member.last_name}`.trim() || member.email;

export const memberInitials = (member: PersonName) =>
  (member.first_name || member.email).charAt(0).toUpperCase() +
  (member.last_name ? member.last_name.charAt(0).toUpperCase() : "");

export const userDisplayName = (user: { first_name: string; last_name: string; email: string }) =>
  `${user.first_name} ${user.last_name}`.trim() || user.email;
