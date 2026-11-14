import "./users.css";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { SiteUser } from "../common/entities/user";
import AddUserDialog from "./features/components/AddUserDialog";
import EditUserDialog from "./features/components/EditUserDialog";
import { useUsers } from "./features/hooks/useUsers";
import { UserFilters } from "./sections/UserFilters";
import { UsersTable } from "./sections/UsersTable";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";

export default function UsersPage() {
  const usersState = useUsers();
  const { t } = useTranslation();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<SiteUser | null>(null);
  const {
    setUsers, loading, error, search, setSearch, role, setRole,
    status, setStatus, actionError, filteredUsers, remove,
  } = usersState;

  function addUser(user: SiteUser) {
    setUsers((current) => [...current, user]);
    setSearch(""); setRole("all"); setStatus("all"); setShowAdd(false);
  }

  function updateUser(user: SiteUser) {
    setUsers((current) => current.map((item) => item.id === user.id ? user : item));
    setEditing(null);
  }

  function confirmDelete(user: SiteUser) {
    const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
    if (window.confirm(t("users.confirmDelete", { name }))) void remove(user);
  }

  return <main className="min-h-screen min-w-0 bg-white p-6 md:p-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-gray-500">{t("users.subtitle")}</p></div><button type="button" onClick={() => setShowAdd(true)} disabled={showAdd || loading || Boolean(error)} className="flex cursor-pointer items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white disabled:opacity-50"><Plus size={16} aria-hidden="true" />{t("users.addUser")}</button></header>
    {showAdd && <AddUserDialog onClose={() => setShowAdd(false)} onCreated={addUser} />}
    {editing && <EditUserDialog user={editing} onClose={() => setEditing(null)} onUpdated={updateUser} />}
    <UserFilters search={search} setSearch={setSearch} role={role} setRole={setRole} status={status} setStatus={setStatus} />
    {actionError && <p role="alert" className="mb-3 text-sm text-red-600">{actionError}</p>}
    {loading ? <p role="status" className="text-sm text-gray-500">{t("users.loading")}</p> : error ? <p role="alert" className="text-sm text-red-600">{error}</p> : <UsersTable users={filteredUsers} onEdit={setEditing} onDelete={confirmDelete} />}
  </div></main>;
}
