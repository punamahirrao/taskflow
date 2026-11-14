import { Search } from "lucide-react";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface UserFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export function UserFilters({ search, setSearch, role, setRole, status, setStatus }: UserFiltersProps) {
  const { t } = useTranslation();
  return <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 p-4">
    <label className="flex min-w-0 flex-col gap-1 text-sm text-gray-600">{t("users.searchLabel")}<span className="relative"><Search size={16} aria-hidden="true" className="absolute left-3 top-3 text-gray-400" /><input type="search" placeholder={t("users.searchPlaceholder")} value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 sm:w-64" /></span></label>
    <label className="flex flex-col gap-1 text-sm text-gray-600">{t("users.role")}<select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2"><option value="all">{t("users.allRoles")}</option><option value="admin">{t("users.roleAdministrator")}</option><option value="user">{t("users.roleUser")}</option></select></label>
    <label className="flex flex-col gap-1 text-sm text-gray-600">{t("users.status")}<select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-gray-200 bg-white px-3 py-2"><option value="all">{t("users.allStatus")}</option><option value="active">{t("users.statusActive")}</option><option value="inactive">{t("users.statusInactive")}</option></select></label>
  </div>;
}
