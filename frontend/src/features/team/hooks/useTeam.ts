import { useEffect, useMemo, useState } from "react";
import { addProjectMember, removeProjectMember, scheduleProjectMemberRemoval } from "../../../api/projectMembers";
import { getUsers } from "../../../api/users";
import type { TeamRosterMember } from "../../../entities/team";
import type { SiteUser } from "../../../entities/user";
import { useProjectContext } from "../../projects/context/useProjectContext";
import { buildTeamRoster, sortTeamRoster } from "../teamRoster";
import { ASSIGNABLE_ROLES, NO_ROLES, TEAM_FILTER_KEY } from "../teamPolicy";

export function useTeam() {
  const { projects, selectedId, loading: projectsLoading, error: projectsError, reload } = useProjectContext();
  const [teamProjectOverride, setTeamProjectOverride] = useState<number | null | undefined>(() => {
    const saved = sessionStorage.getItem(TEAM_FILTER_KEY);
    if (saved === null) return undefined;
    return saved === "all" ? null : Number(saved);
  });
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newRole, setNewRole] = useState("member");
  const [busy, setBusy] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [removalError, setRemovalError] = useState("");

  useEffect(() => {
    let active = true;
    getUsers()
      .then((result) => { if (active) setUsers(result.filter((user) => user.is_active)); })
      .catch((cause: unknown) => { if (active) setUsersError(cause instanceof Error ? cause.message : "Unable to load system users."); })
      .finally(() => { if (active) setUsersLoading(false); });
    return () => { active = false; };
  }, []);

  const requestedProjectId = teamProjectOverride === undefined ? selectedId : teamProjectOverride;
  const projectId = projects.some((item) => item.id === requestedProjectId) ? requestedProjectId : null;
  const scopedProjects = useMemo(
    () => projectId === null ? projects : projects.filter((project) => project.id === projectId),
    [projects, projectId],
  );
  const project = projectId === null ? null : scopedProjects[0] ?? null;
  const allMembers = useMemo(() => buildTeamRoster(projects), [projects]);
  const members = useMemo(() => {
    if (!project) return allMembers;
    const rolesById = new Map((project.members ?? []).map((member) => [member.id, member.role]));
    return sortTeamRoster(allMembers
      .filter((member) => rolesById.has(member.id))
      .map((member) => ({
        ...member,
        roles: [rolesById.get(member.id)!],
        can_view_profile: project.my_role === "owner" || project.my_role === "admin",
      })));
  }, [allMembers, project]);
  const projectMemberIds = useMemo(() => new Set((project?.members ?? []).map((member) => member.id)), [project]);
  const candidates = useMemo(() => project ? users.filter((user) => !projectMemberIds.has(user.id)) : [], [project, users, projectMemberIds]);
  const selectedUser = candidates.find((user) => String(user.id) === selectedUserId) ?? null;
  const roles = ASSIGNABLE_ROLES[project?.my_role ?? ""] ?? NO_ROLES;
  const effectiveRole = roles.includes(newRole) ? newRole : roles[0] ?? "member";
  const loading = projectsLoading || usersLoading;
  const error = projectsError || usersError;

  function selectProject(id: number | null) {
    sessionStorage.setItem(TEAM_FILTER_KEY, id === null ? "all" : String(id));
    setTeamProjectOverride(id);
  }

  async function addMember() {
    if (!project || !selectedUser || !roles.includes(effectiveRole) || busy) return;
    setBusy(true);
    setActionError("");
    try {
      await addProjectMember(project.id, selectedUser.id, effectiveRole);
      setSelectedUserId("");
      await reload();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Unable to add this team member.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(member: TeamRosterMember, removalDate: string | null): Promise<boolean> {
    if (!project || busyMemberId !== null) return false;
    setBusyMemberId(member.id);
    setRemovalError("");
    try {
      if (removalDate) await scheduleProjectMemberRemoval(project.id, member.id, removalDate);
      else await removeProjectMember(project.id, member.id);
      await reload();
      return true;
    } catch (cause) {
      setRemovalError(cause instanceof Error ? cause.message : "Unable to remove this project member.");
      return false;
    } finally {
      setBusyMemberId(null);
    }
  }

  return {
    projects,
    project,
    projectId,
    selectProject,
    allProjectsSelected: projectId === null,
    members,
    candidates,
    selectedUserId: selectedUser ? selectedUserId : "",
    setSelectedUserId,
    roles,
    newRole: effectiveRole,
    setNewRole,
    loading,
    error,
    actionError,
    busy,
    busyMemberId,
    removalError,
    addMember,
    removeMember,
  };
}
