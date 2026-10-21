import {
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function ProjectSidebar() {
  const [isAdministrationOpen, setIsAdministrationOpen] = useState(false);
  const { pathname } = useLocation();
  const isProjectPage = pathname.startsWith("/project/");
  const menuClass = (isActive: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
      isActive
        ? "bg-purple-100 font-semibold text-purple-700"
        : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
    }`;

  return (
    <aside className="border-b border-gray-200 bg-gray-50 p-5 md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-r md:border-b-0">
      <div className="mb-8 px-3">
        <h2 className="text-2xl font-bold text-purple-700">TaskFlow</h2>
      </div>

      <nav aria-label="Main navigation" className="space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => menuClass(isActive)}
        >
          <LayoutDashboard size={18} aria-hidden="true" />
          Dashboard
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => menuClass(isActive || isProjectPage)}
        >
          <FolderKanban size={18} aria-hidden="true" />
          Projects
        </NavLink>
        <button
          type="button"
          disabled
          title="My Profile is not available yet"
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400"
        >
          <UserRound size={18} aria-hidden="true" />
          My Profile
        </button>
        <div>
          <button
            type="button"
            onClick={() => setIsAdministrationOpen((isOpen) => !isOpen)}
            aria-expanded={isAdministrationOpen}
            aria-controls="administration-menu"
            className={menuClass(false)}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            Administration
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
              Users
            </NavLink>
            <button
              type="button"
              disabled
              title="User administration is not available yet"
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400"
            >
            </button>
            <button
              type="button"
              disabled
              title="Administration settings are not available yet"
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400"
            >
              <Settings size={16} aria-hidden="true" />
              Settings
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}

export default ProjectSidebar;