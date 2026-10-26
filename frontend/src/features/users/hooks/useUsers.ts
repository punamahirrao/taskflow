import { useEffect, useMemo, useState } from "react";
import { deleteUser, getUsers } from "../../../api/users";
import type { SiteUser } from "../../../entities/user";

export function useUsers() {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    getUsers().then((result) => { if (active) setUsers(result); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load users."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const text = `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase();
    const matchesRole = role === "all" || (role === "admin" ? user.is_staff : !user.is_staff);
    const matchesStatus = status === "all" || (status === "active" ? user.is_active : !user.is_active);
    return text.includes(search.trim().toLowerCase()) && matchesRole && matchesStatus;
  }), [users, search, role, status]);

  async function remove(user: SiteUser) {
    setActionError("");
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Unable to delete user.");
    }
  }

  return { users, setUsers, loading, error, search, setSearch, role, setRole, status, setStatus, actionError, filteredUsers, remove };
}
