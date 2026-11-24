import type { DeliveryFlowBucket } from "../../entities/deliveryFlow";
import { DeliveryFlowBar } from "./DeliveryFlowBar";

export function DeliveryFlowChartGroup({
  bucket,
  peak,
}: {
  bucket: DeliveryFlowBucket;
  peak: number;
}) {
  return (
    <div className="delivery-chart-group">
      <div
        className="delivery-chart-bars"
        title={`${bucket.label}: ${bucket.created} added, ${bucket.completed} completed`}
      >
        <DeliveryFlowBar value={bucket.created} peak={peak} kind="added" />
        <DeliveryFlowBar value={bucket.completed} peak={peak} kind="finished" />
      </div>
      <span className="delivery-chart-label">{bucket.label}</span>
    </div>
  );
}
