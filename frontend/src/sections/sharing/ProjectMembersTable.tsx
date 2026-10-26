import { SquarePen, Trash } from "lucide-react";
import type { ProjectMember } from "../../entities/project";
import type { SiteUser } from "../../entities/user";

type Row = ProjectMember & { user: SiteUser };
export function ProjectMembersTable({ rows, roles, choices, setChoices, busyId, onCommit, onRemove, userName }: {
  rows: Row[]; roles: string[]; choices: Record<number, string>; setChoices: (update: (current: Record<number, string>) => Record<number, string>) => void;
  busyId: number | null; onCommit: (user: SiteUser, current: string, selected: string) => void; onRemove: (user: SiteUser) => void; userName: (user: SiteUser) => string;
}) {
  return <div className="overflow-x-auto rounded-lg border border-gray-200"><table className="w-full text-left text-sm"><caption className="sr-only">People on this project</caption><thead className="bg-purple-100 text-purple-700"><tr><th scope="col" className="px-4 py-3 font-medium">User</th><th scope="col" className="px-4 py-3 font-medium">Project role</th><th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th></tr></thead>
    <tbody className="divide-y divide-purple-200">{rows.map(({ user, role: current }) => {
      const locked = !roles.includes(current); const selected = choices[user.id] ?? current; const busy = busyId === user.id;
      return <tr key={user.id} className="hover:bg-gray-50"><td className="px-4 py-4"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 font-medium text-white">{userName(user).charAt(0).toUpperCase()}</span><div><p className="font-medium text-gray-900">{userName(user)}</p><p className="text-xs text-gray-500">{user.email}</p></div></div></td>
        <td className="px-4 py-4">{locked ? <span className="rounded-full border border-purple-200 bg-purple-100 px-2 py-1 text-xs capitalize">{current}</span> : <select value={selected} disabled={busy} onChange={(event) => setChoices((state) => ({ ...state, [user.id]: event.target.value }))} onBlur={() => onCommit(user, current, selected)} className="rounded-md border border-gray-200 bg-white px-3 py-2 capitalize" aria-label={`Role for ${userName(user)}`} id={`role-${user.id}`}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}<option value="__remove">Remove from project</option></select>}</td>
        <td className="px-4 py-4">{locked ? <span className="text-xs text-gray-400">Cannot be changed</span> : <div className="inline-flex gap-4"><button type="button" title="Edit role" aria-label={`Edit role for ${userName(user)}`} disabled={busy} onClick={() => document.getElementById(`role-${user.id}`)?.focus()} className="text-green-600 hover:underline disabled:opacity-40"><SquarePen size={16} aria-hidden="true" /></button><button type="button" title="Remove from project" aria-label={`Remove ${userName(user)}`} disabled={busy} onClick={() => { if (window.confirm(`Remove ${userName(user)} from this project?`)) onRemove(user); }} className="text-red-600 hover:underline disabled:opacity-40"><Trash size={16} aria-hidden="true" /></button></div>}</td></tr>;
    })}{rows.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No one has been added yet.</td></tr>}</tbody></table></div>;
}
