import type { useReleaseDetailsModel } from "../../features/release-details/useReleaseDetailsModel";
import { ReleaseOverview } from "./ReleaseOverview";
import { ReleaseApprovalFlow } from "./ReleaseApprovalFlow";
export function ReleaseDetailsView({
  model,
}: {
  model: ReturnType<typeof useReleaseDetailsModel>;
}) {
  return (
    <div className="release-stack">
      <ReleaseOverview model={model} />
      <ReleaseApprovalFlow model={model} />
    </div>
  );
}
