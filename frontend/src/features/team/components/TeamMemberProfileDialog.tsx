import { Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getTeamMemberProfile } from "../../../api/profile";
import type { TeamMemberProfile } from "../../../entities/user";
import type { TeamRosterMember } from "../../../entities/team";
import { memberInitials, memberName } from "../../../shared/utils/people";
import { useDialogBehavior } from "../../../shared/hooks/useDialogBehavior";

type Props = { member: TeamRosterMember; canViewFullProfile: boolean; onClose: () => void };

export function TeamMemberProfileDialog({ member, canViewFullProfile, onClose }: Props) {
  const [profile, setProfile] = useState<TeamMemberProfile | null>(null);
  const [loading, setLoading] = useState(canViewFullProfile);
  const [error, setError] = useState("");
  useDialogBehavior(onClose, loading);

  useEffect(() => {
    if (!canViewFullProfile) return;
    let active = true;
    getTeamMemberProfile(member.id)
      .then((result) => { if (active) setProfile(result); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load this profile."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [member.id, canViewFullProfile]);

  const person = profile ?? member;
  const initials = memberInitials(person) || memberName(person).slice(0, 1).toUpperCase();

  return <div onClick={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="team-profile-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-lg font-semibold text-purple-700">
            {person.photo_url ? <img src={person.photo_url} alt={`${memberName(person)} profile`} className="h-full w-full object-cover" /> : initials}
          </span>
          <div className="min-w-0"><h2 id="team-profile-title" className="truncate text-lg font-semibold text-gray-900">{memberName(person)}</h2><p className="mt-0.5 truncate text-sm text-purple-700">{person.job_title || "Job title not added"}</p></div>
        </div>
        <button type="button" autoFocus onClick={onClose} aria-label="Close profile" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><X size={20} aria-hidden="true" /></button>
      </header>

      {loading ? <p role="status" className="mt-6 text-sm text-gray-500">Loading profile…</p> : error ? <p role="alert" className="mt-6 text-sm text-red-600">{error}</p> : <div className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileDetail label="Email"><span className="flex items-center gap-2"><Mail size={15} aria-hidden="true" />{person.email}</span></ProfileDetail>
          <ProfileDetail label="Project roles">{member.roles.join(" · ")}</ProfileDetail>
        </div>
        {canViewFullProfile && profile && <>
          <ProfileDetail label="Department">{profile.department || "Not provided"}</ProfileDetail>
          <ProfileDetail label="About Me"><p className="whitespace-pre-wrap">{profile.about_me || "No profile details provided yet."}</p></ProfileDetail>
        </>}
        <ProfileDetail label="Projects working on"><ul className="space-y-1">{member.projects.map((project) => <li key={project.id}>{project.name}</li>)}</ul></ProfileDetail>
        {!canViewFullProfile && <p className="text-xs text-gray-500">Profile details are limited to project information.</p>}
      </div>}
    </section>
  </div>;
}

function ProfileDetail({ label, children }: { label: string; children: ReactNode }) {
  return <div><h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</h3><div className="mt-1 text-sm leading-6 text-gray-800">{children}</div></div>;
}
