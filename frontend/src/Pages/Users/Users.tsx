import { useEffect, useState } from "react";
import { Plus, Search, SquarePen, Trash, } from "lucide-react";
import { apiFetch } from "../../utils/api";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
};

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [actionError, setActionError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);    

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const data = await apiFetch<User[]>("/accounts/users/");

        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load users.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const text =
      `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase();

    const matchesSearch = text.includes(search.trim().toLowerCase());
    const matchesRole =
      role === "all" ||
      (role === "admin" ? user.is_staff : !user.is_staff);
    const matchesStatus =
      status === "all" ||
      (status === "active" ? user.is_active : !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async (user: User) => {
    setActionError("");
    try {
      await apiFetch(`/accounts/users/${user.id}/`, {
        method: "DELETE",
      });
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to delete user.");
    } 
  };

  return (
    <main className="min-h-screen min-w-0 bg-white p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-900">
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span>Users</span>
        </div> */}

        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-purple-400">Users</h1>
            <p className="mt-1 text-sm text-gray-500">
              View user accounts, roles, and account status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddUser(true)}
            disabled={showAddUser || loading || Boolean(error)}
            title="Add a new user"
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white disabled:opacity-50 cursor-pointer"
          >
            <Plus size={16} aria-hidden="true" />
            Add User
          </button>
        </header>
        {showAddUser && (
          <AddUser
            onClose={() => setShowAddUser(false)}
            onCreated={(newUser) => {
              setUsers((prevUsers) => [...prevUsers, newUser]);
              setSearch("");
              setRole("all");
              setStatus("all");
              setShowAddUser(false);
            }}
          />
        )}
        {editingUser && (
        <EditUser
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUpdated={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setEditingUser(null);
            }}
        />
        )}
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 p-4">
          <label className="flex min-w-0 flex-col gap-1 text-sm text-gray-600">
            Search users
            <span className="relative">
              <Search
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="search"
                placeholder="Search users..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 sm:w-64"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="user">User</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p role="status" className="text-sm text-gray-500">
            Loading users...
          </p>
        ) : error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Workspace user accounts</caption>
              <thead className="bg-purple-100 text-purple-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">User</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                  <th scope="col" className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-200">
                {filteredUsers.map((user) => {
                  const name =
                    `${user.first_name} ${user.last_name}`.trim() || user.email;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 font-medium text-white"
                          >
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full border border-purple-200 bg-purple-100 px-2 py-1 text-xs">
                          {user.is_staff ? "Administrator" : "User"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {new Date(user.date_joined).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td >
                        <div className="inline-flex gap-4">
                        <button 
                         type="button"
                         title="Edit User"
                         onClick={() => setEditingUser(user)}
                        className="text-green-600 hover:underline">
                        <SquarePen size={16} aria-hidden="true" />
                        </button>
                        <button 
                         type="button"
                         title="Delete User"
                         aria-label={`Delete ${user.first_name} ${user.last_name}`}
                         onClick={()=> {
                            if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
                              void handleDeleteUser(user);
                            }
                         }}
                        className="text-red-600 hover:underline">
                          <Trash size={16} aria-hidden="true" />
                        </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Users;