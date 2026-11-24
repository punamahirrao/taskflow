export function DeliveryFlowBar({
  value,
  peak,
  kind,
}: {
  value: number;
  peak: number;
  kind: "added" | "finished";
}) {
  return (
    <span className={`delivery-bar ${kind}`} style={{ height: `${(value / peak) * 100}%` }}>
      {value > 0 && <small>{value}</small>}
    </span>
  );
}
