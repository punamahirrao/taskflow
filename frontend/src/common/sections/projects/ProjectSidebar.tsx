import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ProjectSwitcher from "../../features/projects/components/ProjectSwitcher";
import { useTranslation } from "../../shared/i18n/hooks/useTranslation";
import OrganizationSwitcher from "../../../organizations/components/OrganizationSwitcher";
import { NAVIGATION_ITEMS, type NavigationItem } from "../../features/navigation/navigationCatalog";
import { useNavigation } from "../../features/navigation/NavigationContext";
import TaskflowLogo from "../../components/TaskflowLogo";

const primary = NAVIGATION_ITEMS.filter((item) => item.section === "primary");
const planning = NAVIGATION_ITEMS.filter((item) => item.section === "planning");
const utility = NAVIGATION_ITEMS.filter((item) => item.section === "utility");
const planningItem = NAVIGATION_ITEMS.find((item) => item.id === "planning")!;

export default function ProjectSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { resolve } = useNavigation();
  const {
    label: planningLabel,
    Icon: PlanningIcon,
    icon: planningIcon,
    color: planningColor,
  } = resolve(planningItem);
  const [planningOpen, setPlanningOpen] = useState(pathname.startsWith("/planning"));
  function link(item: NavigationItem) {
    const { label, Icon, icon, color } = resolve(item);
    const path = item.path;
    return (
      <NavLink
        key={item.id}
        to={path}
        title={collapsed ? label : undefined}
        aria-label={label}
        data-icon={icon}
        data-testid={`nav-${path.slice(1).replaceAll("/", "-")}`}
        className={({ isActive }) =>
          `shell-nav-link ${isActive || (path === "/projects" && /^\/project\/\d+$/.test(pathname)) ? "active" : ""}`
        }
      >
        <Icon
          size={18}
          aria-hidden="true"
          style={{ color: `color-mix(in srgb, ${color} 60%, white)` }}
        />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    );
  }
  return (
    <aside className={`platform-sidebar shell-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="shell-brand">
        <NavLink to="/dashboard" aria-label="Taskflow home">
          <TaskflowLogo compact={collapsed} inverse />
        </NavLink>
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      <ProjectSwitcher collapsed={collapsed} />
      <nav aria-label={t("nav.main")} className="shell-navigation">
        {primary.map(link)}
        <button
          type="button"
          data-testid="nav-planning"
          data-icon={planningIcon}
          title={collapsed ? planningLabel : undefined}
          aria-label={planningLabel}
          aria-expanded={planningOpen}
          className={`shell-nav-link ${pathname.startsWith("/planning") ? "active" : ""}`}
          onClick={() => setPlanningOpen(!planningOpen)}
        >
          <PlanningIcon
            size={18}
            style={{ color: `color-mix(in srgb, ${planningColor} 60%, white)` }}
          />
          {!collapsed && (
            <>
              <span>{planningLabel}</span>
              <ChevronDown size={14} className={`ml-auto ${planningOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
        {planningOpen && (
          <div className={collapsed ? "" : "shell-submenu"}>{planning.map(link)}</div>
        )}
        <div className="shell-nav-divider" />
        {utility.map(link)}
      </nav>
      <OrganizationSwitcher collapsed={collapsed} />
    </aside>
  );
}
