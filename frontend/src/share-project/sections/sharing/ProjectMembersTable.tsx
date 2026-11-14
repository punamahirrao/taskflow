import { SquarePen, Trash } from "lucide-react";
import type { SiteUser } from "../../../common/entities/user";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ProjectMemberRow } from "../../entities/shareProject";

interface ProjectMembersTableProps {
  rows: ProjectMemberRow[];
  roles: string[];
  choices: Record<number, string>;
  setChoices: (update: (current: Record<number, string>) => Record<number, string>) => void;
  busyId: number | null;
  onCommit: (user: SiteUser, current: string, selected: string) => void;
  onRemove: (user: SiteUser) => void;
  userName: (user: SiteUser) => string;
}

export function ProjectMembersTable({ rows, roles, choices, setChoices, busyId, onCommit, onRemove, userName }: ProjectMembersTableProps) {
  const { t } = useTranslation();
  return <div className="overflow-x-auto rounded-lg border border-gray-200"><table className="w-full text-left text-sm"><caption className="sr-only">{t("shareProject.table.caption")}</caption><thead className="bg-purple-100 text-purple-700"><tr><th scope="col" className="px-4 py-3 font-medium">{t("shareProject.table.user")}</th><th scope="col" className="px-4 py-3 font-medium">{t("shareProject.table.projectRole")}</th><th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">{t("shareProject.table.actions")}</span></th></tr></thead>
    <tbody className="divide-y divide-purple-200">{rows.map(({ user, role: current }) => {
      const locked = !roles.includes(current); const selected = choices[user.id] ?? current; const busy = busyId === user.id;
      return <tr key={user.id} className="hover:bg-gray-50"><td className="px-4 py-4"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 font-medium text-white">{userName(user).charAt(0).toUpperCase()}</span><div><p className="font-medium text-gray-900">{userName(user)}</p><p className="text-xs text-gray-500">{user.email}</p></div></div></td>
        <td className="px-4 py-4">{locked ? <span className="rounded-full border border-purple-200 bg-purple-100 px-2 py-1 text-xs capitalize">{current}</span> : <select value={selected} disabled={busy} onChange={(event) => setChoices((state) => ({ ...state, [user.id]: event.target.value }))} onBlur={() => onCommit(user, current, selected)} className="rounded-md border border-gray-200 bg-white px-3 py-2 capitalize" aria-label={t("shareProject.table.roleFor", { name: userName(user) })} id={`role-${user.id}`}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}<option value="__remove">{t("shareProject.table.removeFromProject")}</option></select>}</td>
        <td className="px-4 py-4">{locked ? <span className="text-xs text-gray-400">{t("shareProject.table.cannotChange")}</span> : <div className="inline-flex gap-4"><button type="button" title={t("shareProject.table.editRole")} aria-label={t("shareProject.table.editRoleFor", { name: userName(user) })} disabled={busy} onClick={() => document.getElementById(`role-${user.id}`)?.focus()} className="text-green-600 hover:underline disabled:opacity-40"><SquarePen size={16} aria-hidden="true" /></button><button type="button" title={t("shareProject.table.removeFromProject")} aria-label={t("shareProject.table.removeMember", { name: userName(user) })} disabled={busy} onClick={() => { if (window.confirm(t("shareProject.confirmRemove", { name: userName(user) }))) onRemove(user); }} className="text-red-600 hover:underline disabled:opacity-40"><Trash size={16} aria-hidden="true" /></button></div>}</td></tr>;
    })}{rows.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">{t("shareProject.table.empty")}</td></tr>}</tbody></table></div>;
}
