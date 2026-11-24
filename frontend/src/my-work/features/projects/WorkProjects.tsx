import type { Project } from "../../../common/entities/project";
import type { Task } from "../../../features/tasks/entities/task";
import { WorkProjectsPanel } from "../../components/projects/WorkProjectsPanel";
import { WorkProjectsHeader } from "../../components/projects/WorkProjectsHeader";
import { WorkProjectsList } from "../../components/projects/WorkProjectsList";

export function WorkProjects({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const mine = projects.map((project) => {
    const assigned = tasks.filter((task) => task.project === project.id);
    const completed = assigned.filter((task) => task.status === "done").length;
    return { project, completed, open: assigned.length - completed };
  });
  return (
    <WorkProjectsPanel>
      <WorkProjectsHeader />
      <WorkProjectsList projects={mine} />
    </WorkProjectsPanel>
  );
}
