import { DeliverySummaryCopy } from "../../components/delivery-summary/DeliverySummaryCopy";
import { DeliverySummaryPanel } from "../../components/delivery-summary/DeliverySummaryPanel";
import { DeliveryCompletionRing } from "../../components/delivery-summary/DeliveryCompletionRing";
import type { DeliverySnapshot } from "../../entities/delivery";
import { percent } from "../../utils/deliveryFormat";

export function DeliverySummary({
  snapshot,
  selectedName,
}: {
  snapshot: DeliverySnapshot;
  selectedName?: string;
}) {
  const total = snapshot.projects.reduce((sum, project) => sum + project.total, 0);
  const done = snapshot.projects.reduce((sum, project) => sum + project.done, 0);
  const risk = snapshot.projects.reduce((sum, project) => sum + project.at_risk, 0);
  const count = snapshot.projects.filter((project) => project.at_risk > 0).length;
  const completion = percent(done, total);
  let headline = "No open risks flagged";
  let description = `${total - done} open work items across ${snapshot.projects.length} ${snapshot.projects.length === 1 ? "project" : "projects"}.`;
  if (risk) {
    headline = "Delivery needs attention";
    description = `${risk} open ${risk === 1 ? "item is" : "items are"} overdue or blocked${selectedName ? "" : ` across ${count} ${count === 1 ? "project" : "projects"}`}.`;
  } else if (!total) {
    headline = "Ready to plan delivery";
    description = "Add work items to start tracking progress and deadlines.";
  } else if (done === total) {
    headline = "All tracked work is complete";
    description = `${done} ${done === 1 ? "work item is" : "work items are"} marked done.`;
  }

  return (
    <DeliverySummaryPanel>
      <DeliverySummaryCopy
        selectedName={selectedName}
        headline={headline}
        description={description}
      />
      <DeliveryCompletionRing completion={completion} />
    </DeliverySummaryPanel>
  );
}
