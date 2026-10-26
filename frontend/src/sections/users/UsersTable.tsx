import { SquarePen, Trash } from "lucide-react";
import type { SiteUser } from "../../entities/user";

export function UsersTable({ users, onEdit, onDelete }: { users: SiteUser[]; onEdit: (user: SiteUser) => void; onDelete: (user: SiteUser) => void }) {
  return <div className="overflow-x-auto rounded-lg border border-gray-200"><table className="w-full text-left text-sm"><caption className="sr-only">Workspace user accounts</caption>
    <thead className="bg-purple-100 text-purple-700"><tr><th scope="col" className="px-4 py-3 font-medium">User</th><th scope="col" className="px-4 py-3 font-medium">Role</th><th scope="col" className="px-4 py-3 font-medium">Status</th><th scope="col" className="px-4 py-3 font-medium">Joined</th><th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th></tr></thead>
    <tbody className="divide-y divide-purple-200">{users.map((user) => {
      const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
      return <tr key={user.id} className="hover:bg-gray-50"><td className="px-4 py-4"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 font-medium text-white">{name.charAt(0).toUpperCase()}</span><div><p className="font-medium text-gray-900">{name}</p><p className="text-xs text-gray-500">{user.email}</p></div></div></td>
        <td className="px-4 py-4"><span className="rounded-full border border-purple-200 bg-purple-100 px-2 py-1 text-xs">{user.is_staff ? "Administrator" : "User"}</span></td>
        <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{user.is_active ? "Active" : "Inactive"}</span></td>
        <td className="whitespace-nowrap px-4 py-4 text-gray-600">{new Date(user.date_joined).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</td>
        <td className="px-4 py-4"><div className="inline-flex gap-4"><button type="button" title="Edit User" aria-label={`Edit ${name}`} onClick={() => onEdit(user)} className="text-green-600 hover:underline"><SquarePen size={16} aria-hidden="true" /></button><button type="button" title="Delete User" aria-label={`Delete ${name}`} onClick={() => onDelete(user)} className="text-red-600 hover:underline"><Trash size={16} aria-hidden="true" /></button></div></td></tr>;
    })}{users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found.</td></tr>}</tbody>
  </table></div>;
}
