import type { CapacityMember } from "../../entities/capacity";

export function CapacityMemberAvailability({
  member,
  workingDays,
}: {
  member: CapacityMember;
  workingDays: number;
}) {
  return (
    <div className="capacity-availability">
      <span>
        {member.available_days ?? "—"} / {workingDays} days
      </span>
      <progress
        max={workingDays || 1}
        value={member.available_days ?? 0}
        aria-label={`${member.name} available weekdays`}
      />
      <small className="capacity-muted">
        {member.absence_days ? `${member.absence_days} days off` : "No time off"}
      </small>
    </div>
  );
}
