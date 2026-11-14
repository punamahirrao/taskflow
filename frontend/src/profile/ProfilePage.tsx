import "./profile.css";
import { useEffect, useState } from "react";
import { getProfile } from "../common/api/profile";
import type { Profile } from "../common/entities/user";
import ProfileForm from "./features/components/ProfileForm";
import ProfilePhotoCard from "./features/components/ProfilePhotoCard";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { translate } from "../common/shared/i18n/translate";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile().then(setProfile).catch((err: unknown) => setError(err instanceof Error ? err.message :         translate("profile.loadError")));
      }, []);

  return <main className="min-h-screen min-w-0 bg-white p-6 md:p-8"><div className="mx-auto max-w-4xl">
    <header className="mb-6"><p className="text-sm text-gray-500">{t("profile.subtitle")}</p></header>
    {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : !profile ? <p role="status" className="text-sm text-gray-500">{t("profile.loading")}</p> :
      <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <ProfilePhotoCard profile={profile} onChange={setProfile} />
        <ProfileForm profile={profile} onSaved={setProfile} />
      </div>}
  </div></main>;
}
