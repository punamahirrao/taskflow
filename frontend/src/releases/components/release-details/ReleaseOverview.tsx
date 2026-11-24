import { ReleaseOverviewHeader } from "./ReleaseOverviewHeader";
import { ReleaseOverviewBody } from "./ReleaseOverviewBody";

import type { useReleaseDetailsModel } from "../../features/release-details/useReleaseDetailsModel";
export function ReleaseOverview({ model }: { model: ReturnType<typeof useReleaseDetailsModel> }) {
  return (
    <section className="release-panel" aria-labelledby="release-title">
      <ReleaseOverviewHeader model={model} />
      <ReleaseOverviewBody model={model} />
    </section>
  );
}
