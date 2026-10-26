import { Ellipsis } from "lucide-react";

export type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
};

type ProjectCardProps = {
  project: Project;
  onOpen: () => void;
};

function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <div
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-cyan-600">
          Project #{project.id}
        </span>
        <Ellipsis size={16} aria-hidden="true" className="text-gray-400" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        {project.name}
      </h2>

      <p className="line-clamp-3 text-gray-600">
        {project.description || "No description provided."}
      </p>
    </div>
  );
}

export default ProjectCard;