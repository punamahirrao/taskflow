import { UserPlus } from "lucide-react";
import type { SiteUser } from "../../common/entities/user";
import { userDisplayName } from "../../common/shared/utils/people";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface AddTeamMemberFormProps {
  candidates: SiteUser[];
  roles: string[];
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  role: string;
  setRole: (role: string) => void;
  busy: boolean;
  onAdd: () => void;
}

export function AddTeamMemberForm({
  candidates,
  roles,
  selectedUserId,
  setSelectedUserId,
  role,
  setRole,
  busy,
  onAdd,
}: AddTeamMemberFormProps) {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus size={18} aria-hidden="true" className="text-purple-600" />
        <h2 className="text-base font-semibold text-gray-900">{t("team.addMemberTitle")}</h2>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium text-gray-700">
          {t("team.systemUser")}
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5"
          >
            <option value="">{t("team.chooseUser")}</option>
            {candidates.map((user) => (
              <option key={user.id} value={user.id}>
                {userDisplayName(user)} · {user.email}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          {t("team.projectRole")}
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 capitalize"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!selectedUserId || busy}
          onClick={onAdd}
          className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? t("team.adding") : t("team.addMember")}
        </button>
      </div>
      {candidates.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">{t("team.allUsersOnProject")}</p>
      )}
    </section>
  );
}
