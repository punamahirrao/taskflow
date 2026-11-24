import {
  BarChart3,
  Flag,
  FolderKanban,
  GitBranch,
  LayoutTemplate,
  Milestone,
  Target,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
const pages = {
  "/releases": {
    title: "Releases",
    description: "Bring delivery milestones and release plans together.",
    icon: Flag,
    settings: "/settings/work-management/release-rules",
  },
  "/goals": {
    title: "Goals",
    description: "Connect your team’s work to meaningful outcomes.",
    icon: Target,
    settings: "/settings/reports",
  },
  "/planning/project-plans": {
    title: "Project Plans",
    description: "Open a project to review its work, schedule and delivery plan.",
    icon: FolderKanban,
    settings: "/settings/project-planning",
  },
  "/planning/charts": {
    title: "Charts",
    description: "Explore delivery metrics and project progress.",
    icon: BarChart3,
    settings: "/settings/reports",
  },
  "/planning/milestones": {
    title: "Milestones",
    description: "Track the important checkpoints in your project plans.",
    icon: Milestone,
    settings: "/settings/project-planning/milestone-types",
  },
  "/planning/dependencies": {
    title: "Dependencies",
    description: "Identify relationships between work and keep delivery moving.",
    icon: GitBranch,
    settings: "/settings/project-planning/dependency-types",
  },
  "/templates": {
    title: "Templates",
    description: "Explore reusable starting points for your team’s work.",
    icon: LayoutTemplate,
    settings: "/settings/templates",
  },
};
export function useOrganizationSectionPageModel() {
  const { pathname } = useLocation();
  const page = pages[pathname as keyof typeof pages];
  const { projects, selectedId, loading, error } = useProjectContext();
  const missing = !page;
  const Icon = page?.icon ?? Flag;
  const isPlans = pathname === "/planning/project-plans";

  return {
    missing,
    pathname,
    page: page ?? pages["/planning/project-plans"],
    projects,
    selectedId,
    loading,
    error,
    Icon,
    isPlans,
  };
}
