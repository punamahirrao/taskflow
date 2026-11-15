import {
  BarChart3,
  CalendarDays,
  Columns3,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  BrainCircuit,
  ListTodo,
  Settings,
  ShieldCheck,
  TrainFront,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import ProjectSwitcher from "../../features/projects/components/ProjectSwitcher";
import { NavLink, useLocation } from "react-router-dom";
import type { TranslationKey } from "../../entities/language";
import { useTranslation } from "../../shared/i18n/hooks/useTranslation";
import { useProjectContext } from "../../features/projects/context/useProjectContext";
import UserMenu from "../../features/profile/components/UserMenu";

interface NavItem {
  path: string;
  icon: typeof LayoutDashboard;
  label: TranslationKey;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard", icon: LayoutDashboard, label: "app.dashboard" },
  { path: "/projects", icon: FolderKanban, label: "app.projects" },
  { path: "/backlog", icon: ListTodo, label: "app.backlog" },
  { path: "/sprint-train", icon: TrainFront, label: "app.sprintTrain" },
  { path: "/boards", icon: Columns3, label: "app.boards" },
  { path: "/ai-estimator", icon: BrainCircuit, label: "app.aiEstimator" },
  { path: "/calendar", icon: CalendarDays, label: "app.calendar" },
  { path: "/reports", icon: BarChart3, label: "app.reports" },
];

function ProjectSidebar() {
  const [isAdministrationOpen, setIsAdministrationOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { selectedId } = useProjectContext();
  const projectSettingsPath = selectedId ? `/project/${selectedId}/settings` : "/projects";
  const isProjectPage = pathname.startsWith("/project/") && !pathname.endsWith("/settings");
  const menuClass = (isActive: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
      isActive
        ? "bg-purple-100 font-semibold text-purple-700"
        : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
    }`;

  return (
    <aside className="platform-sidebar border-b border-gray-200 bg-gray-50 p-5 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:overflow-y-auto md:border-r md:border-b-0">
      <div className="mb-5 px-3">
        <h2 className="text-2xl font-bold text-purple-700">{t("app.taskflow")}</h2>
      </div>

      <ProjectSwitcher />

      <nav aria-label={t("nav.main")} className="space-y-1 md:flex-1">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => <NavLink key={path} to={path} data-testid={`nav-${path.slice(1)}`} className={({ isActive }) => menuClass(isActive || (path === "/projects" && isProjectPage) || (path === "/boards" && pathname.startsWith("/boards/")))}>
          <Icon size={18} aria-hidden="true" />{t(label)}
        </NavLink>)}
        <NavLink to={projectSettingsPath} className={({ isActive }) => menuClass(isActive || pathname.endsWith("/settings"))}>
          <Settings size={18} aria-hidden="true" />{t("app.projectSettings")}
        </NavLink>
        <div>
          <button
            type="button"
            onClick={() => setIsAdministrationOpen((isOpen) => !isOpen)}
            aria-expanded={isAdministrationOpen}
            aria-controls="administration-menu"
            data-testid="nav-administration-toggle"
            className={menuClass(false)}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            {t("nav.administration")}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`ml-auto transition-transform ${isAdministrationOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div id="administration-menu" hidden={!isAdministrationOpen} className="ml-5 mt-1 space-y-1 border-l border-gray-200 pl-3">
            <NavLink
              to="/users"
              className={({ isActive }) => menuClass(isActive)}
            >
              <UsersRound size={16} aria-hidden="true" />
              {t("app.users")}
            </NavLink>
            <NavLink to="/portfolio" className={({ isActive }) => menuClass(isActive)}><FolderKanban size={16} aria-hidden="true" />{t("app.portfolio")}</NavLink>
            <NavLink to="/settings" className={({ isActive }) => menuClass(isActive)}>
              <Settings size={16} aria-hidden="true" />
              {t("app.settings")}
            </NavLink>
          </div>
        </div>
      </nav>
      <div className="mt-6 border-t border-gray-200 pt-4 md:mt-auto">
        <UserMenu />
      </div>
    </aside>
  );
}

export default ProjectSidebar;
