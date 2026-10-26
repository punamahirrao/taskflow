import { useState } from "react";
import { changePassword, updateProfile } from "../../../api/profile";
import type { Profile } from "../../../entities/user";

type Props = { profile: Profile; onSaved: (profile: Profile) => void };

const input = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 read-only:cursor-not-allowed read-only:text-gray-500";
const label = "mb-1 mt-4 block text-sm text-gray-700";

export default function ProfileForm({ profile, onSaved }: Props) {
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [jobTitle, setJobTitle] = useState(profile.job_title);
  const [department, setDepartment] = useState(profile.department);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setSuccess("");

    const changingPassword = Boolean(currentPassword || newPassword || confirmPassword);
    if (changingPassword) {
      if (!currentPassword || !newPassword) return setError("Enter your current and new password.");
      if (newPassword !== confirmPassword) return setError("New password and confirmation do not match.");
    }

    setSaving(true);
    try {
      const saved = await updateProfile({
        first_name: firstName.trim(), last_name: lastName.trim(),
        job_title: jobTitle.trim(), department: department.trim(),
      });
      onSaved(saved);
      if (changingPassword) {
        await changePassword({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      }
      setSuccess(changingPassword ? "Profile and password updated." : "Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Personal Details</h2>
    <div className="grid gap-x-4 sm:grid-cols-2">
      <div><label htmlFor="first-name" className={label}>First Name</label><input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={150} className={input} /></div>
      <div><label htmlFor="last-name" className={label}>Last Name</label><input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={150} className={input} /></div>
    </div>
    <label htmlFor="job-title" className={label}>Job Title</label>
    <input id="job-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} maxLength={100} className={input} />
    <label htmlFor="department" className={label}>Department</label>
    <input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} maxLength={100} className={input} />
    <label htmlFor="email" className={label}>Email Address</label>
    <input id="email" value={profile.email} readOnly aria-readonly="true" className={input} />

    <hr className="my-6 border-gray-200" />
    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Login &amp; Security</h2>
    <label htmlFor="current-password" className={label}>Current Password</label>
    <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={input} />
    <label htmlFor="new-password" className={label}>New Password</label>
    <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={input} />
    <label htmlFor="confirm-password" className={label}>Confirm Password</label>
    <input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={input} />

    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    {success && <p role="status" className="mt-4 text-sm text-green-600">{success}</p>}
    <button type="submit" disabled={saving} className="mt-6 cursor-pointer rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
  </form>;
}
