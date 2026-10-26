import type { ProjectMember } from "../../entities/project";

export const memberName = (member: ProjectMember) =>
  `${member.first_name} ${member.last_name}`.trim() || member.email;

export const memberInitials = (member: ProjectMember) =>
  (member.first_name || member.email).charAt(0).toUpperCase() +
  (member.last_name ? member.last_name.charAt(0).toUpperCase() : "");
