import { useState } from "react";
import { changePassword, updateProfile } from "../api/profile";
import type { Profile } from "../../common/entities/user";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import ProfileField from "./ProfileField";
import {
  ProfileDivider,
  ProfileError,
  ProfileFormPanel,
  ProfileSaveButton,
  ProfileSectionTitle,
  ProfileSuccess,
} from "../Profile.styles";
import { firstValidationError, passwordChangeSchema, profileSchema } from "../../common/validation/schemas";
import { useToast } from "../../common/features/notifications/useToast";

interface ProfileFormProps {
  profile: Profile;
  onSaved: (profile: Profile) => void;
}

export default function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [jobTitle, setJobTitle] = useState(profile.job_title);
  const [department, setDepartment] = useState(profile.department);
  const [aboutMe, setAboutMe] = useState(profile.about_me);
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
      const passwordError = firstValidationError(passwordChangeSchema, { currentPassword, newPassword, confirmPassword });
      if (passwordError) { setError(passwordError); toast("error", passwordError); return; }
    }
    const profileError = firstValidationError(profileSchema, { firstName, lastName, jobTitle, department, aboutMe });
    if (profileError) { setError(profileError); toast("error", profileError); return; }

    setSaving(true);
    try {
      const saved = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        job_title: jobTitle.trim(),
        department: department.trim(),
        about_me: aboutMe.trim(),
      });
      onSaved(saved);
      if (changingPassword) {
        await changePassword({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
      setSuccess(changingPassword ? t("profile.passwordUpdated") : t("profile.updated"));
      toast("success", changingPassword ? t("profile.passwordUpdated") : t("profile.updated"));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("profile.saveError");
      setError(message); toast("error", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileFormPanel onSubmit={handleSubmit}>
      <ProfileSectionTitle>{t("profile.personalDetails")}</ProfileSectionTitle>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <ProfileField id="first-name" labelId="first-name-label" inputId="first-name-input" label="profile.firstName" value={firstName} onChange={setFirstName} maxLength={150} />
        <ProfileField id="last-name" labelId="last-name-label" inputId="last-name-input" label="profile.lastName" value={lastName} onChange={setLastName} maxLength={150} />
      </div>
      <ProfileField id="job-title" labelId="job-title-label" inputId="job-title-input" label="profile.jobTitle" value={jobTitle} onChange={setJobTitle} maxLength={100} required />
      <ProfileField id="department" labelId="department-label" inputId="department-input" label="profile.department" value={department} onChange={setDepartment} maxLength={100} />
      <ProfileField id="about-me" labelId="about-me-label" inputId="about-me-input" label="profile.aboutMe" value={aboutMe} onChange={setAboutMe} type="textarea" maxLength={5000} rows={5} placeholder={t("profile.aboutMePlaceholder")} />
      <ProfileField id="email" labelId="email-label" inputId="email-input" label="profile.email" value={profile.email} readOnly />

      <ProfileDivider />
      <ProfileSectionTitle>{t("profile.loginSecurity")}</ProfileSectionTitle>
      <ProfileField id="current-password" labelId="current-password-label" inputId="current-password-input" label="profile.currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={setCurrentPassword} />
      <ProfileField id="new-password" labelId="new-password-label" inputId="new-password-input" label="profile.newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={setNewPassword} />
      <ProfileField id="confirm-password" labelId="confirm-password-label" inputId="confirm-password-input" label="profile.confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={setConfirmPassword} />

      {error && <ProfileError role="alert">{error}</ProfileError>}
      {success && <ProfileSuccess role="status">{success}</ProfileSuccess>}
      <ProfileSaveButton type="submit" disabled={saving}>{saving ? t("profile.saving") : t("profile.saveChanges")}</ProfileSaveButton>
    </ProfileFormPanel>
  );
}
