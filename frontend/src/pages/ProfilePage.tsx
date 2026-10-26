import { useEffect, useState } from "react";
import { getProfile } from "../api/profile";
import type { Profile } from "../entities/user";
import ProfileForm from "../features/profile/components/ProfileForm";
import ProfilePhotoCard from "../features/profile/components/ProfilePhotoCard";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile().then(setProfile).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load profile."));
  }, []);

  return <main className="min-h-screen min-w-0 bg-white p-6 md:p-8"><div className="mx-auto max-w-4xl">
    <header className="mb-6"><h1 className="text-2xl font-semibold text-purple-400">My Profile</h1><p className="mt-1 text-sm text-gray-500">Manage your personal information and security preferences.</p></header>
    {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : !profile ? <p role="status" className="text-sm text-gray-500">Loading profile...</p> :
      <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <ProfilePhotoCard profile={profile} onChange={setProfile} />
        <ProfileForm profile={profile} onSaved={setProfile} />
      </div>}
  </div></main>;
}
