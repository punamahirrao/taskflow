import { useRef, useState } from "react";
import { removeProfilePhoto, uploadProfilePhoto } from "../../../api/profile";
import type { Profile } from "../../../entities/user";

type Props = { profile: Profile; onChange: (profile: Profile) => void };

const MAX_BYTES = 5 * 1024 * 1024;

export default function ProfilePhotoCard({ profile, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<Profile>) {
    setBusy(true);
    setError("");
    try {
      onChange(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > MAX_BYTES) return setError("Image must be 5 MB or smaller.");
    void run(() => uploadProfilePhoto(file));
  }

  const name = `${profile.first_name} ${profile.last_name}`.trim() || profile.email;
  const initials = (profile.first_name || profile.email).charAt(0).toUpperCase() + (profile.last_name ? profile.last_name.charAt(0).toUpperCase() : "");

  return <section className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-sm font-semibold text-gray-900">Profile Photo</h2>
    <div className="mx-auto mb-5 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-4xl font-semibold text-purple-700">
      {profile.photo_url ? <img src={profile.photo_url} alt={`${name} profile`} className="h-full w-full object-cover" /> : initials}
    </div>
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleFile} className="hidden" />
    <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="w-full cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Working..." : "Upload New Photo"}</button>
    <button type="button" disabled={busy || !profile.photo_url} onClick={() => void run(removeProfilePhoto)} className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">Remove</button>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
  </section>;
}
