import { percent } from "../utils/deliveryFormat";

export function DeliveryProgress({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label: string;
}) {
  return (
    <div className="delivery-progress">
      <progress max={100} value={percent(done, total)} aria-label={label} />
      <small>
        {done}/{total} done
      </small>
    </div>
  );
}
