import { Flag } from "lucide-react";

export function ComingUpHeader() {
  return (
    <div className="delivery-panel-heading">
      <div>
        <h2 id="delivery-milestones-title">Coming up</h2>
      </div>
      <Flag size={20} className="delivery-heading-icon" />
    </div>
  );
}
