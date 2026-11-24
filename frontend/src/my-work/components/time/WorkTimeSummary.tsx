import { WorkTimeRing } from "./WorkTimeRing";
import { WorkTimeCategories } from "./WorkTimeCategories";
export function WorkTimeSummary({ totals, total }: { totals: number[]; total: number }) {
  return (
    <div className="my-work-time">
      <WorkTimeRing totals={totals} total={total} />
      <WorkTimeCategories totals={totals} />
    </div>
  );
}
