import { CalendarDays, Mail, Trash2 } from "lucide-react";
import type { TeamRosterMember } from "../../entities/team";
import { memberInitials, memberName } from "../../shared/utils/people";

const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
];

type Props = {
  member: TeamRosterMember;
  onViewProfile?: () => void;
  onViewMore?: () => void;
  onRemove?: () => void;
  removing?: boolean;
};

export function TeamMemberCard({ member, onViewProfile, onViewMore, onRemove, removing = false }: Props) {
  const color = AVATAR_COLORS[member.id % AVATAR_COLORS.length];
  const summary = <>
    <span aria-hidden="true" className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ${color}`}>
      {member.photo_url ? <img src={member.photo_url} alt="" className="h-full w-full object-cover" /> : memberInitials(member) || memberName(member).slice(0, 1).toUpperCase()}
    </span>
    <span className="min-w-0 flex-1 text-left">
      <span className="block truncate text-sm font-semibold text-gray-900">{memberName(member)}</span>
      <span className="mt-0.5 block truncate text-sm text-purple-700">{member.job_title || "Job title not added"}</span>
      <span className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-sm text-gray-500"><Mail size={14} aria-hidden="true" className="shrink-0" /><span className="truncate">{member.email}</span></span>
    </span>
  </>;

  return <article className="flex h-[260px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    {onViewProfile ? <button type="button" onClick={onViewProfile} aria-label={`View ${memberName(member)} full profile`} className="flex min-w-0 items-center gap-4 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-purple-400">{summary}</button> : <div className="flex min-w-0 items-center gap-4">{summary}</div>}

    <div className="mt-3"><span className="inline-block max-w-full truncate rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">{member.roles.join(" · ")}</span></div>
    <div className="mt-3 min-h-0 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Projects working on</p>
      <p className="mt-1 truncate text-sm text-gray-700">{member.projects[0]?.name ?? "No project"}</p>
      {member.removal_date && <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-amber-700"><CalendarDays size={13} aria-hidden="true" />Removal scheduled for {member.removal_date}</p>}
    </div>
    <footer className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
      {member.projects.length > 1 && <button type="button" onClick={onViewMore} className="text-sm font-medium text-purple-700 hover:text-purple-900 focus:outline-none focus:underline">View more</button>}
      {onRemove && <button type="button" disabled={removing} onClick={onRemove} aria-label={`Remove ${memberName(member)} from this project`} title="Remove team member" className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={17} aria-hidden="true" /></button>}
    </footer>
  </article>;
}
