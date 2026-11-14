import { useState } from "react";
import { updateUser } from "../../../common/api/users";
import type { User } from "../../../common/entities/user";
import { X } from "lucide-react";
import { useDialogBehavior } from "../../../common/shared/hooks/useDialogBehavior";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

interface EditUserProps {
  user: User;
  onUpdated: (user: User) => void;
  onClose: () => void;
}

function EditUser({ user, onUpdated, onClose }: EditUserProps) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [jobTitle, setJobTitle] = useState(user.job_title);
  const [isActive, setIsActive] = useState(user.is_active);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useDialogBehavior(onClose, submitting);

  const requestClose = () => {
  if (submitting) return;
  onClose();
};

  const handleSubmit = async (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const updatedUser = await updateUser(user.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          job_title: jobTitle.trim(),
          is_active: isActive,
      });

      onUpdated(updatedUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("users.updateFailed"),
      );
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100";

  return (
    <div
        onClick={(event) => {
            if (event.target === event.currentTarget) requestClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        >
        <div className="mb-4 flex items-center justify-between">
        <h2
            id="edit-user-title"
            className="text-lg font-semibold text-gray-900"
        >
            {t("users.editUser")}
        </h2>

        <button
            type="button"
            onClick={requestClose}
            disabled={submitting}
            aria-label={t("users.closeDialog")}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
            <X size={20} aria-hidden="true" />
        </button>
        </div>

      <form onSubmit={handleSubmit} aria-busy={submitting}>
        <fieldset disabled={submitting} className="space-y-4">
          <legend className="sr-only">{t("users.editAccountDetails")}</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("users.firstName")}
              <input
                type="text"
                autoComplete="off"
                maxLength={150}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              {t("users.lastName")}
              <input
                type="text"
                autoComplete="off"
                maxLength={150}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            {t("users.email")}
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {t("users.jobTitle")}
            <input type="text" required maxLength={100} autoComplete="organization-title" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} className={inputClass} />
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
            />
            {t("users.statusActive")}
            </label>

          <p className="text-sm text-gray-500">
            {t("users.updatedAsActive")}
          </p>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              {t("users.cancel")}
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? t("users.updating") : t("users.updateUser")}
            </button>
          </div>
        </fieldset>
      </form>
      </div>
    </div>
  );
}

export default EditUser;
