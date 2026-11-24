import { CalendarClock } from "lucide-react";
export function NeedsAttentionHeader() {
  return (
    <div className="delivery-panel-heading">
      <div>
        <h2 id="delivery-attention-title">Needs attention</h2>
      </div>
      <CalendarClock className="delivery-heading-icon" size={21} />
    </div>
  );
}
