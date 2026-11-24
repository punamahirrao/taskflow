import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function ActiveSprintsHeader({ sprintCount }: { sprintCount: number }) {
  return (
    <div className="delivery-panel-heading">
      <div>
        <h2 id="delivery-sprints-title">
          Active sprints <span>{sprintCount}</span>
        </h2>
      </div>
      <Link className="delivery-link" to="/sprint-train">
        Sprint Train <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
