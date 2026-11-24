import { ArrowRight } from "lucide-react";

export function AssignedProjectsMore({ onMore }: { onMore: () => void }) {
  return (
    <div className="project-more">
      <button type="button" className="project-text-link" onClick={onMore}>
        More assigned projects <ArrowRight size={15} />
      </button>
    </div>
  );
}
