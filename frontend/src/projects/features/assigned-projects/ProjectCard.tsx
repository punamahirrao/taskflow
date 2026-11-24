import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { timeLeft } from "../../utils/timeLeft";
import { AssignedProjectCardLayout } from "../../components/assigned-projects/AssignedProjectCardLayout";
import { AssignedProjectOpenButton } from "../../components/assigned-projects/AssignedProjectOpenButton";
import { AssignedProjectHeading } from "../../components/assigned-projects/AssignedProjectHeading";
import { AssignedProjectDescription } from "../../components/assigned-projects/AssignedProjectDescription";
import { AssignedProjectProgress } from "../../components/assigned-projects/AssignedProjectProgress";
import { AssignedProjectFooter } from "../../components/assigned-projects/AssignedProjectFooter";
import { ProjectDefaultButton } from "../../components/assigned-projects/ProjectDefaultButton";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onToggleDefault: () => void;
}

function ProjectCard({ project, onOpen, onToggleDefault }: ProjectCardProps) {
  const { t } = useTranslation();
  const isDefault = Boolean(project.is_default);
  const progress = project.progress ?? 0;
  const due = timeLeft(project.end_date, t);
  const initial = project.name.trim().charAt(0).toUpperCase() || "P";
  const ownerMember = project.members?.find(
    (member) => member.id === project.owner || member.role === "owner",
  );
  const owner =
    project.owner_details ??
    (ownerMember
      ? {
          id: ownerMember.id,
          name: `${ownerMember.first_name} ${ownerMember.last_name}`.trim() || ownerMember.email,
          photo_url: ownerMember.photo_url,
        }
      : null);

  return (
    <AssignedProjectCardLayout
      defaultAction={
        <ProjectDefaultButton
          name={project.name}
          isDefault={isDefault}
          onToggle={onToggleDefault}
        />
      }
    >
      <AssignedProjectOpenButton name={project.name} onOpen={onOpen} />
      <AssignedProjectHeading
        name={project.name}
        initial={initial}
        status={project.status}
        isDefault={isDefault}
      />
      <AssignedProjectDescription description={project.description} />
      <AssignedProjectProgress name={project.name} progress={progress} />
      <AssignedProjectFooter owner={owner} due={due} />
    </AssignedProjectCardLayout>
  );
}
export default ProjectCard;
