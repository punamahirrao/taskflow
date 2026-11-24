import type { CapacityMember } from "../../entities/capacity";
import type { CapacityDraft, ChangeCapacityDraft } from "../../entities/capacityPlanning";
import { CapacityMemberRow } from "./CapacityMemberRow";
import { CapacityMemberTableHead } from "./CapacityMemberTableHead";
import { CapacityMembersEmptyState } from "./CapacityMembersEmptyState";

export function CapacityMemberTable({
  members,
  workingDays,
  canManage,
  draft,
  busy,
  onDraft,
}: {
  members: CapacityMember[];
  workingDays: number;
  canManage: boolean;
  draft: CapacityDraft;
  busy: boolean;
  onDraft: ChangeCapacityDraft;
}) {
  if (!members.length) return <CapacityMembersEmptyState />;
  return (
    <div
      className="capacity-table-wrap"
      role="region"
      aria-label="Team member capacity"
      tabIndex={0}
    >
      <table>
        <caption>
          Budgets apply to this sprint. Holidays and absences are shared across this project’s
          sprints.
        </caption>
        <CapacityMemberTableHead />
        <tbody>
          {members.map((member) => (
            <CapacityMemberRow
              key={member.id}
              member={member}
              workingDays={workingDays}
              canManage={canManage}
              draft={draft[member.id]}
              busy={busy}
              onDraft={onDraft}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
