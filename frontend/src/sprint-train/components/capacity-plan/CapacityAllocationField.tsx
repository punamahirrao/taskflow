import type { CapacityMember } from "../../entities/capacity";

export function CapacityAllocationField({
  member,
  value,
  canManage,
  busy,
  onChange,
}: {
  member: CapacityMember;
  value: string;
  canManage: boolean;
  busy: boolean;
  onChange: (value: string) => void;
}) {
  return canManage ? (
    <input
      type="number"
      aria-label={`Allocation percent for ${member.name}`}
      value={value}
      min={0}
      max={100}
      required
      disabled={busy}
      onChange={(event) => onChange(event.target.value)}
    />
  ) : (
    <>{member.allocation_percent}%</>
  );
}
