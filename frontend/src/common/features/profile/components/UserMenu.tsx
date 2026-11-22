import { LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../../../profile/api/profile";
import type { Profile } from "../../../entities/user";
import { clearAuthSession } from "../../../store/auth";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import Avatar from "../../../components/Avatar";
import { useAppSelector } from "../../../store";

export default function UserMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sessionUser = useAppSelector((state) => state.session.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
    const onUpdated = (event: Event) => setProfile((event as CustomEvent<Profile>).detail);
    window.addEventListener("profile-updated", onUpdated);
    return () => window.removeEventListener("profile-updated", onUpdated);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name =
    `${profile?.first_name ?? sessionUser?.first_name ?? ""} ${profile?.last_name ?? sessionUser?.last_name ?? ""}`.trim() ||
    profile?.email ||
    sessionUser?.email ||
    t("profileMenu.account");

  return (
    <div ref={ref} className="profile-menu">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={profile?.email}
        className="profile-menu-trigger"
      >
        <span className="sr-only">{t("profileMenu.openMenu")}</span>
        <Avatar name={name} photoUrl={profile?.photo_url} />
        <span className="profile-menu-name min-w-0">
          <span className="profile-menu-display-name block truncate text-sm font-medium">
            {name}
          </span>
          {profile?.email && (
            <span className="profile-menu-email block truncate text-xs">{profile.email}</span>
          )}
        </span>
      </button>
      {open && (
        <div role="menu" className="profile-menu-dropdown">
          <div className="border-b border-gray-100 px-4 pb-2">
            <p className="truncate text-sm font-medium text-gray-900">{name}</p>
            {profile && <p className="truncate text-xs text-gray-500">{profile.email}</p>}
          </div>
          <Link
            role="menuitem"
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <UserRound size={16} aria-hidden="true" />
            {t("nav.myProfile")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              clearAuthSession();
              navigate("/login");
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} aria-hidden="true" />
            {t("profileMenu.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
