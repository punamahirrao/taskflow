import type { Release, ApprovalStep } from "../../../releases/entities/release";
import { WorkApprovalItem } from "./WorkApprovalItem";
import { WorkApprovalsEmptyState } from "./WorkApprovalsEmptyState";
export function WorkApprovalsList({
  items,
}: {
  items: { release: Release; step: ApprovalStep }[];
}) {
  if (!items.length) return <WorkApprovalsEmptyState />;
  return (
    <ul className="my-work-list">
      {items.map(({ release, step }) => (
        <WorkApprovalItem key={step.id} release={release} step={step} />
      ))}
    </ul>
  );
}
