import type { DeliveryFlowBucket } from "../../entities/deliveryFlow";
import { DeliveryFlowChartGroup } from "./DeliveryFlowChartGroup";

export function DeliveryFlowChart({
  buckets,
  peak,
}: {
  buckets: DeliveryFlowBucket[];
  peak: number;
}) {
  return (
    <div className="delivery-chart" aria-hidden="true">
      {buckets.map((bucket) => (
        <DeliveryFlowChartGroup key={bucket.label} bucket={bucket} peak={peak} />
      ))}
    </div>
  );
}
