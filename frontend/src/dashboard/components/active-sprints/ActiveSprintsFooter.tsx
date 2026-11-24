import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function ActiveSprintsFooter({
  visibleCount,
  sprintCount,
}: {
  visibleCount: number;
  sprintCount: number;
}) {
  return (
    <div className="delivery-panel-footer">
      <span>
        Showing {visibleCount} of {sprintCount}
      </span>
      <Link className="delivery-link" to="/sprint-train" aria-label="More active sprints">
        More <ArrowRight size={15} />
      </Link>
    </div>
  );
}
