import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function ComingUpFooter() {
  return (
    <div className="delivery-panel-footer">
      <Link className="delivery-link" to="/calendar" aria-label="More upcoming targets">
        More <ArrowRight size={15} />
      </Link>
    </div>
  );
}
