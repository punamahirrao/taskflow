import { DeliveryPeriodSelect } from "./DeliveryPeriodSelect";
export function DeliveryFlowHeader({
  period,
  onPeriodChange,
}: {
  period: number;
  onPeriodChange: (period: number) => void;
}) {
  return (
    <div className="delivery-panel-heading">
      <div>
        <h2 id="delivery-trend-title">Delivery flow</h2>
      </div>
      <DeliveryPeriodSelect period={period} onPeriodChange={onPeriodChange} />
    </div>
  );
}
