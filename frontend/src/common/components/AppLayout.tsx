import { Outlet } from "react-router-dom";
import { ProjectProvider } from "../features/projects/context/ProjectProvider";
import ProjectSidebar from "../sections/projects/ProjectSidebar";
import { useState } from "react";
import TopBar from "./TopBar";
import OrganizationProvider from "../../organizations/context/OrganizationProvider";
import NavigationProvider from "../features/navigation/NavigationProvider";
import TypographyProvider from "../features/typography/TypographyProvider";
import { AppShellStyles } from "./AppShell.styles";

function AppLayoutContent() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("taskflow:sidebar-collapsed");
    return saved === null ? window.matchMedia("(max-width: 700px)").matches : saved === "true";
  });
  function toggle() {
    setCollapsed((previous) => {
      localStorage.setItem("taskflow:sidebar-collapsed", String(!previous));
      return !previous;
    });
  }
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <AppShellStyles />
      <ProjectSidebar collapsed={collapsed} onToggle={toggle} />
      <div className="shell-body">
        <TopBar />
        <div className="shell-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <OrganizationProvider>
      <TypographyProvider>
        <NavigationProvider>
          <ProjectProvider>
            <AppLayoutContent />
          </ProjectProvider>
        </NavigationProvider>
      </TypographyProvider>
    </OrganizationProvider>
  );
}
