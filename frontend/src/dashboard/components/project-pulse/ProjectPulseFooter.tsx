import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
export function ProjectPulseFooter({
  visibleCount,
  projectCount,
}: {
  visibleCount: number;
  projectCount: number;
}) {
  return (
    <div className="delivery-panel-footer">
      <span>
        Showing {visibleCount} of {projectCount}
      </span>
      <Link className="delivery-link" to="/projects" aria-label="More projects">
        More <ArrowRight size={15} />
      </Link>
    </div>
  );
}
