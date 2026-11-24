import type { DeliveryFlowBucket } from "../../entities/deliveryFlow";
export function DeliveryFlowDataRow({ bucket }: { bucket: DeliveryFlowBucket }) {
  return (
    <tr>
      <th scope="row">{bucket.label}</th>
      <td>{bucket.created}</td>
      <td>{bucket.completed}</td>
    </tr>
  );
}
