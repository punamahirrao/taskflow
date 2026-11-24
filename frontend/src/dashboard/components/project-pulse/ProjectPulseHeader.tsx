import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
export function ProjectPulseHeader() {
  return (
    <div className="delivery-panel-heading">
      <div>
        <h2 id="delivery-projects-title">Project pulse</h2>
      </div>
      <Link className="delivery-link" to="/projects">
        Project directory <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
