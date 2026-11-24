import type { CapacityMember } from "../../entities/capacity";
import Avatar from "../../../common/components/Avatar";
import { formatDate } from "../../utils/sprintTrain";

export function CapacityMemberPerson({ member }: { member: CapacityMember }) {
  return (
    <div className="capacity-person">
      <Avatar name={member.name} photoUrl={member.photo_url} size={32} />
      <div>
        <strong>{member.name}</strong>
        <small>
          {member.job_title || member.role}
          {member.removal_date ? ` · Ends ${formatDate(member.removal_date)}` : ""}
        </small>
      </div>
    </div>
  );
}
