import type { CapacityMember } from "../../entities/capacity";
import type { ChangeCapacityDraft } from "../../entities/capacityPlanning";
import { shownCapacityPoints as shown } from "../../utils/capacityFormat";
import { CapacityMemberPerson } from "./CapacityMemberPerson";
import { CapacityMemberAvailability } from "./CapacityMemberAvailability";
import { CapacityBudgetField } from "./CapacityBudgetField";
import { CapacityAllocationField } from "./CapacityAllocationField";

export function CapacityMemberRow({
  member,
  workingDays,
  canManage,
  draft,
  busy,
  onDraft,
}: {
  member: CapacityMember;
  workingDays: number;
  canManage: boolean;
  draft?: { points: string; allocation: string };
  busy: boolean;
  onDraft: ChangeCapacityDraft;
}) {
  return (
    <tr>
      <td>
        <CapacityMemberPerson member={member} />
      </td>
      <td>
        <CapacityMemberAvailability member={member} workingDays={workingDays} />
      </td>
      <td>
        <CapacityBudgetField
          member={member}
          value={draft?.points ?? ""}
          canManage={canManage}
          busy={busy}
          onChange={(value) => onDraft(member.id, "points", value)}
        />
      </td>
      <td>
        <CapacityAllocationField
          member={member}
          value={draft?.allocation ?? "100"}
          canManage={canManage}
          busy={busy}
          onChange={(value) => onDraft(member.id, "allocation", value)}
        />
      </td>
      <td>
        <strong>{shown(member.available_points)}</strong>
      </td>
      <td
        className={
          member.available_points !== null && member.assigned_points > member.available_points
            ? "capacity-danger"
            : ""
        }
      >
        {member.assigned_points} pts
        {member.available_points !== null && member.assigned_points > member.available_points && (
          <small style={{ display: "block" }}>
            Over by {Math.round((member.assigned_points - member.available_points) * 10) / 10}
          </small>
        )}
      </td>
    </tr>
  );
}
