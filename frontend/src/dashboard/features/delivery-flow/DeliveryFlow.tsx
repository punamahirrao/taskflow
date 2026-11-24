import { useState } from "react";
import { DeliveryFlowChart } from "../../components/delivery-flow/DeliveryFlowChart";
import { DeliveryFlowDataTable } from "../../components/delivery-flow/DeliveryFlowDataTable";
import { DeliveryFlowEmptyState } from "../../components/delivery-flow/DeliveryFlowEmptyState";
import { DeliveryFlowHeader } from "../../components/delivery-flow/DeliveryFlowHeader";
import { DeliveryFlowPanel } from "../../components/delivery-flow/DeliveryFlowPanel";
import { DeliveryFlowSummary } from "../../components/delivery-flow/DeliveryFlowSummary";
import type { DeliverySnapshot } from "../../entities/delivery";
import { shortDate } from "../../utils/deliveryFormat";

export function DeliveryFlow({ trend }: { trend: DeliverySnapshot["trend"] }) {
  const [period, setPeriod] = useState(7);
  const days = trend.slice(-period);
  const bucketSize = period / 7;
  const buckets = Array.from({ length: Math.ceil(days.length / bucketSize) }, (_, index) => {
    const bucket = days.slice(index * bucketSize, (index + 1) * bucketSize);
    const label =
      bucketSize === 1
        ? shortDate(bucket[0].date)
        : `${shortDate(bucket[0].date)}–${shortDate(bucket[bucket.length - 1].date)}`;
    return {
      label,
      created: bucket.reduce((sum, day) => sum + day.created, 0),
      completed: bucket.reduce((sum, day) => sum + day.completed, 0),
    };
  });
  const peak = Math.max(1, ...buckets.flatMap((bucket) => [bucket.created, bucket.completed]));
  const created = days.reduce((sum, day) => sum + day.created, 0);
  const completed = days.reduce((sum, day) => sum + day.completed, 0);

  return (
    <DeliveryFlowPanel>
      <DeliveryFlowHeader period={period} onPeriodChange={setPeriod} />
      <DeliveryFlowSummary created={created} completed={completed} />
      {created || completed ? (
        <DeliveryFlowChart buckets={buckets} peak={peak} />
      ) : (
        <DeliveryFlowEmptyState />
      )}
      <DeliveryFlowDataTable buckets={buckets} />
    </DeliveryFlowPanel>
  );
}
