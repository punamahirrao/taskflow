import { Search } from "lucide-react";

export function UserFilters({ search, setSearch, role, setRole, status, setStatus }: {
  search: string; setSearch: (value: string) => void; role: string; setRole: (value: string) => void; status: string; setStatus: (value: string) => void;
}) {
  return <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 p-4">
    <label className="flex min-w-0 flex-col gap-1 text-sm text-gray-600">Search users<span className="relative"><Search size={16} aria-hidden="true" className="absolute left-3 top-3 text-gray-400" /><input type="search" placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 sm:w-64" /></span></label>
    <label className="flex flex-col gap-1 text-sm text-gray-600">Role<select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2"><option value="all">All Roles</option><option value="admin">Administrator</option><option value="user">User</option></select></label>
    <label className="flex flex-col gap-1 text-sm text-gray-600">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2"><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
  </div>;
}
