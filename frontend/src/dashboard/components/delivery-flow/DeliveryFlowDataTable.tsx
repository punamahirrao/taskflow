import type { DeliveryFlowBucket } from "../../entities/deliveryFlow";
import { DeliveryFlowDataRow } from "./DeliveryFlowDataRow";

export function DeliveryFlowDataTable({ buckets }: { buckets: DeliveryFlowBucket[] }) {
  return (
    <details className="delivery-chart-table">
      <summary>View chart data</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">Dates</th>
            <th scope="col">Added</th>
            <th scope="col">Completed</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => (
            <DeliveryFlowDataRow key={bucket.label} bucket={bucket} />
          ))}
        </tbody>
      </table>
    </details>
  );
}
