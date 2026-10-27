import type { ProjectMember } from "../../../entities/project";
import { memberInitials, memberName } from "../../../shared/utils/people";

const MAX_VISIBLE = 3;
const COLORS = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-pink-100 text-pink-700", "bg-amber-100 text-amber-700", "bg-cyan-100 text-cyan-700"];

export default function MemberAvatars({ members }: { members: ProjectMember[] }) {
  if (members.length === 0) return null;
  const visible = members.slice(0, MAX_VISIBLE);
  const extra = members.length - visible.length;
  const label = `Team: ${members.map(memberName).join(", ")}`;

  return <div className="flex -space-x-2" role="group" aria-label={label}>
    {visible.map((member) => <span key={member.id} title={memberName(member)} className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white text-[11px] font-semibold ${COLORS[member.id % COLORS.length]}`}>
      {member.photo_url ? <img src={member.photo_url} alt={memberName(member)} className="h-full w-full object-cover" /> : memberInitials(member)}
    </span>)}
    {extra > 0 && <span title={`${extra} more`} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[11px] font-medium text-gray-600">+{extra}</span>}
  </div>;
}
