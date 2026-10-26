import { LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../../api/profile";
import type { Profile } from "../../../entities/user";
import { clearAuthSession } from "../../../store/auth";

export default function UserMenu() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() || profile.email : "Account";
  const initial = (profile?.first_name || profile?.email || "?").charAt(0).toUpperCase();

  return <div ref={ref} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open} aria-label="Open account menu" title={profile?.email} className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-purple-100 text-sm font-semibold text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
      {profile?.photo_url ? <img src={profile.photo_url} alt="" className="h-full w-full object-cover" /> : initial}
    </button>
    {open && <div role="menu" className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
      <div className="border-b border-gray-100 px-4 pb-2"><p className="truncate text-sm font-medium text-gray-900">{name}</p>{profile && <p className="truncate text-xs text-gray-500">{profile.email}</p>}</div>
      <Link role="menuitem" to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UserRound size={16} aria-hidden="true" />My Profile</Link>
      <button type="button" role="menuitem" onClick={() => { clearAuthSession(); navigate("/login"); }} className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"><LogOut size={16} aria-hidden="true" />Sign out</button>
    </div>}
  </div>;
}
