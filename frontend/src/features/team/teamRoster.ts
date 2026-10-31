import type { Project } from "../../entities/project";
import type { TeamRosterMember } from "../../entities/team";

export function buildTeamRoster(projects: Project[]): TeamRosterMember[] {
  const roster = new Map<number, TeamRosterMember>();
  for (const project of projects) {
    for (const member of project.members ?? []) {
      const current = roster.get(member.id) ?? { ...member, projects: [], roles: [], can_view_profile: false };
      if (!current.projects.some((item) => item.id === project.id)) current.projects.push({ id: project.id, name: project.name });
      if (!current.roles.includes(member.role)) current.roles.push(member.role);
      current.can_view_profile ||= project.my_role === "owner" || project.my_role === "admin";
      roster.set(member.id, current);
    }
  }
  return sortTeamRoster([...roster.values()]);
}

export function sortTeamRoster(members: TeamRosterMember[]): TeamRosterMember[] {
  return members.sort((first, second) => {
    const ownerOrder = Number(second.roles.includes("owner")) - Number(first.roles.includes("owner"));
    return ownerOrder || `${first.first_name} ${first.last_name}`.localeCompare(`${second.first_name} ${second.last_name}`);
  });
}
