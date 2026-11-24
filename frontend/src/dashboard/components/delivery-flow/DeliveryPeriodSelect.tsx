export function DeliveryPeriodSelect({
  period,
  onPeriodChange,
}: {
  period: number;
  onPeriodChange: (period: number) => void;
}) {
  return (
    <label className="delivery-period">
      <span className="sr-only">Delivery period</span>
      <select value={period} onChange={(event) => onPeriodChange(Number(event.target.value))}>
        <option value={7}>Last 7 days</option>
        <option value={28}>Last 28 days</option>
      </select>
    </label>
  );
}
