import type { CapacityMember } from "../../entities/capacity";

export function CapacityBudgetField({
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
      aria-label={`Full-sprint points for ${member.name}`}
      value={value}
      min={0}
      max={1000}
      step={0.1}
      placeholder="Not set"
      disabled={busy}
      onChange={(event) => onChange(event.target.value)}
    />
  ) : (
    <>{member.baseline_points ?? "Not set"}</>
  );
}
