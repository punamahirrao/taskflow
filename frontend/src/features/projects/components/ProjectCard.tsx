import { Clock, Star } from "lucide-react";
import type { Project } from "../../../entities/project";
import MemberAvatars from "./MemberAvatars";

type ProjectCardProps = {
  project: Project;
  onOpen: () => void;
  onToggleDefault: () => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function timeLeft(dueDate: string | null | undefined) {
  if (!dueDate) return { label: "No due date", urgent: false };
  const [year, month, day] = dueDate.split("-").map(Number);
  const today = new Date();
  const days = Math.round((new Date(year, month - 1, day).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / DAY_MS);
  if (days < 0) return { label: `${-days} ${-days === 1 ? "day" : "days"} overdue`, urgent: true };
  if (days === 0) return { label: "Due today", urgent: true };
  if (days < 7) return { label: `${days} ${days === 1 ? "day" : "days"} left`, urgent: true };
  const weeks = Math.round(days / 7);
  return { label: `${weeks} ${weeks === 1 ? "week" : "weeks"} left`, urgent: false };
}

function ProjectCard({ project, onOpen, onToggleDefault }: ProjectCardProps) {
  const isDefault = Boolean(project.is_default);
  const progress = project.progress ?? 0;
  const due = timeLeft(project.due_date);
  const initial = project.name.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="relative">
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
        className="flex h-full cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        <div className="flex items-start gap-3 pr-9">
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-lg font-bold text-cyan-600">{initial}</span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">{project.name}</h2>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
              <span>Project #{project.id}</span>
              {isDefault && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">Default</span>}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 min-h-10 text-sm text-gray-600">
          {project.description || "No description provided."}
        </p>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-sm text-gray-600"><span>Progress</span><span>{progress}%</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={`${project.name} progress`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${due.urgent ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600"}`}>
            <Clock size={14} aria-hidden="true" />{due.label}
          </span>
          {project.members && project.members.length > 0 && <MemberAvatars members={project.members} />}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleDefault}
        aria-pressed={isDefault}
        aria-label={isDefault ? `Remove ${project.name} as default project` : `Set ${project.name} as default project`}
        title={isDefault ? "Default project (click to unset)" : "Set as default project"}
        className="absolute right-3 top-3 cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        <Star size={18} aria-hidden="true" className={isDefault ? "fill-amber-400 text-amber-500" : ""} />
      </button>
    </div>
  );
}

export default ProjectCard;
