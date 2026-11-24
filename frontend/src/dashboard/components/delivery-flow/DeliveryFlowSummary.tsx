export function DeliveryFlowSummary({
  created,
  completed,
}: {
  created: number;
  completed: number;
}) {
  return (
    <div className="delivery-chart-summary">
      <span>
        <i className="delivery-chart-key added" />
        <b>{created}</b> added
      </span>
      <span>
        <i className="delivery-chart-key finished" />
        <b>{completed}</b> completed
      </span>
    </div>
  );
}
