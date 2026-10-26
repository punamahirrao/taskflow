import { useEffect, useMemo, useState } from "react";
import { getProjects } from "../../../api/projects";
import { getUsers } from "../../../api/users";
import { addProjectMember, removeProjectMember, updateProjectMember } from "../../../api/projectMembers";
import type { Project, ProjectMember } from "../../../entities/project";
import type { SiteUser } from "../../../entities/user";

const assignableRoles: Record<string, string[]> = { owner: ["admin", "member", "viewer"], admin: ["member", "viewer"] };
const REMOVE = "__remove";
const userName = (user: SiteUser) => `${user.first_name} ${user.last_name}`.trim() || user.email;

export function useProjectSharing(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<SiteUser | null>(null);
  const [newRole, setNewRole] = useState("member");
  const [listOpen, setListOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getProjects(), getUsers()]).then(([projects, allUsers]) => {
      if (!active) return;
      const found = projects.find((item) => item.id === Number(id));
      if (!found) setError("Project not found.");
      else setProject(found);
      setUsers(allUsers.filter((user) => user.is_active));
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to load data.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const roles = assignableRoles[project?.my_role ?? ""] ?? [];
  const members = project?.members ?? [];
  const memberOf = (userId: number) => members.find((member) => member.id === userId);
  const memberRows = useMemo(() => members.map((member) => ({ ...member, user: users.find((user) => user.id === member.id) })).filter((row): row is ProjectMember & { user: SiteUser } => Boolean(row.user)), [members, users]);
  const candidates = users.filter((user) => !memberOf(user.id) && (picked !== null || `${userName(user)} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())));

  function setMembers(update: (current: ProjectMember[]) => ProjectMember[]) {
    setProject((current) => current ? { ...current, members: update(current.members ?? []) } : current);
  }

  async function save(user: SiteUser, role: string) {
    setActionError(""); setBusyId(user.id);
    try {
      const existing = memberOf(user.id);
      const result = existing ? await updateProjectMember(id!, user.id, role) : await addProjectMember(id!, user.id, role);
      setMembers((current) => existing ? current.map((member) => member.id === user.id ? result : member) : [...current, result]);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Unable to save role.");
    } finally { setBusyId(null); }
  }

  async function remove(user: SiteUser) {
    setActionError(""); setBusyId(user.id);
    try {
      await removeProjectMember(id!, user.id);
      setMembers((current) => current.filter((member) => member.id !== user.id));
      setChoices((current) => { const next = { ...current }; delete next[user.id]; return next; });
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Unable to remove member.");
    } finally { setBusyId(null); }
  }

  async function commitRole(user: SiteUser, current: string, selected: string) {
    if (selected === current) return;
    if (selected === REMOVE) {
      if (window.confirm(`Remove ${userName(user)} from this project?`)) await remove(user);
      setChoices((state) => { const next = { ...state }; delete next[user.id]; return next; });
      return;
    }
    await save(user, selected);
    setChoices((state) => { const next = { ...state }; delete next[user.id]; return next; });
  }

  async function addPicked() {
    if (!picked) return;
    await save(picked, newRole);
    setPicked(null); setQuery("");
  }

  return { project, roles, users, choices, setChoices, query, setQuery, picked, setPicked, newRole, setNewRole, listOpen, setListOpen, loading, error, actionError, busyId, candidates, memberRows, userName, memberOf, save, remove, commitRole, addPicked };
}
