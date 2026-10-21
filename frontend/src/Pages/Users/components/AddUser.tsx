import { useState, useEffect  } from "react";
import { apiFetch } from "../../../utils/api";
import type { User } from "../Users";
import { X } from "lucide-react";


type AddUserProps = {
  onClose: () => void;
  onCreated: (user: User) => void;
};

function AddUser({ onClose, onCreated }: AddUserProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const requestClose = () => {
  if (submitting) return;
  onClose();
};

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !submitting) {
      onClose();
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [onClose, submitting]);

useEffect(() => {
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = previousOverflow;
  };
}, []);

  const handleSubmit = async (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const newUser = await apiFetch<User>("/accounts/users/", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });

      onCreated(newUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create user.",
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
            aria-labelledby="add-user-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        >
        <div className="mb-4 flex items-center justify-between">
        <h2
            id="add-user-title"
            className="text-lg font-semibold text-gray-900"
        >
            Add User
        </h2>

        <button
            type="button"
            onClick={requestClose}
            disabled={submitting}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
            <X size={20} aria-hidden="true" />
        </button>
        </div>

      <form onSubmit={handleSubmit} aria-busy={submitting}>
        <fieldset disabled={submitting} className="space-y-4">
          <legend className="sr-only">New account details</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              First name
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
              Last name
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
            Email
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
            Password
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </label>

          <p className="text-sm text-gray-500">
            This account will be created as an active regular user.
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
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </fieldset>
      </form>
      </div>
    </div>
  );
}

export default AddUser;