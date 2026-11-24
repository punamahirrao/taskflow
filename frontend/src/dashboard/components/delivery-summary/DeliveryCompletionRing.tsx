export function DeliveryCompletionRing({ completion }: { completion: number }) {
  return (
    <div
      className="delivery-hero-ring"
      style={{ background: `conic-gradient(#9cebcb ${completion}%, #454e75 ${completion}%)` }}
    >
      <div>
        <strong>{completion}%</strong>
        <span>complete</span>
      </div>
    </div>
  );
}
