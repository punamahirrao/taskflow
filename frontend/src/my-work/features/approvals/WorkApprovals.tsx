import { useAppSelector } from "../../../common/store";
import { dataScope } from "../../../common/api/queryApi";
import { useReleasesQuery } from "../../../releases/api/releases";
import { WorkApprovalsPanel } from "../../components/approvals/WorkApprovalsPanel";
import { WorkApprovalsHeader } from "../../components/approvals/WorkApprovalsHeader";
import { WorkApprovalsError } from "../../components/approvals/WorkApprovalsError";
import { WorkApprovalsLoading } from "../../components/approvals/WorkApprovalsLoading";
import { WorkApprovalsList } from "../../components/approvals/WorkApprovalsList";

export function WorkApprovals({ full, onView }: { full?: boolean; onView?: () => void }) {
  const userId = useAppSelector((state) => String(state.session.user?.id ?? ""));
  const scope = { ...dataScope(), userId };
  const query = useReleasesQuery({ ...scope, mine: true }, { skip: !scope.userId });
  const items = (query.currentData?.items ?? []).flatMap((release) =>
    release.steps
      .filter((step) => String(step.approver_id) === scope.userId)
      .map((step) => ({ release, step })),
  );
  items.sort((a, b) => Number(b.step.can_decide) - Number(a.step.can_decide));
  const visibleItems = items.slice(0, full ? items.length : 4);
  return (
    <WorkApprovalsPanel>
      <WorkApprovalsHeader
        reviewCount={items.filter(({ step }) => step.can_decide).length}
        onView={onView}
      />
      {query.error ? (
        <WorkApprovalsError onRetry={query.refetch} />
      ) : query.isFetching && !query.currentData ? (
        <WorkApprovalsLoading />
      ) : (
        <WorkApprovalsList items={visibleItems} />
      )}
    </WorkApprovalsPanel>
  );
}
