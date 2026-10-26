import { Search } from "lucide-react";
import type { SiteUser } from "../../entities/user";

export function AddProjectMemberForm({ roles, query, setQuery, picked, setPicked, listOpen, setListOpen, candidates, newRole, setNewRole, busy, onAdd, userName }: {
  roles: string[]; query: string; setQuery: (value: string) => void; picked: SiteUser | null; setPicked: (user: SiteUser | null) => void;
  listOpen: boolean; setListOpen: (open: boolean) => void; candidates: SiteUser[]; newRole: string; setNewRole: (role: string) => void;
  busy: boolean; onAdd: () => void; userName: (user: SiteUser) => string;
}) {
  return <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 p-4">
    <div className="relative flex min-w-0 flex-col gap-1 text-sm text-gray-600"><label htmlFor="share-user">Add user</label><span className="relative"><Search size={16} aria-hidden="true" className="absolute left-3 top-3 text-gray-400" /><input id="share-user" type="text" autoComplete="off" placeholder="Search by name or email..." value={query} onChange={(event) => { setQuery(event.target.value); setPicked(null); setListOpen(true); }} onFocus={(event) => { event.target.select(); setListOpen(true); }} onBlur={() => setTimeout(() => setListOpen(false), 150)} className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 sm:w-72" /></span>
      {listOpen && <ul className="absolute left-0 top-full z-20 mt-1 max-h-[260px] w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg sm:w-72">{candidates.length === 0 ? <li className="px-3 py-2 text-gray-500">No users available.</li> : candidates.map((user) => <li key={user.id}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setPicked(user); setQuery(userName(user)); setListOpen(false); }} className="block h-[52px] w-full px-3 py-2 text-left hover:bg-purple-50"><span className="block truncate font-medium leading-5 text-gray-900">{userName(user)}</span><span className="block truncate text-xs text-gray-500">{user.email}</span></button></li>)}</ul>}
    </div>
    <label className="flex flex-col gap-1 text-sm text-gray-600">Role<select value={newRole} onChange={(event) => setNewRole(event.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2 capitalize">{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
    <button type="button" disabled={!picked || busy} onClick={onAdd} className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white disabled:opacity-40">Save</button>
  </div>;
}
