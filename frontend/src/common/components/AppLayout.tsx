import { Outlet } from "react-router-dom";
import { ProjectProvider } from "../features/projects/context/ProjectProvider";
import ProjectSidebar from "../sections/projects/ProjectSidebar";

function AppLayoutContent() {
  return <div className="min-h-screen bg-gray-100 md:grid md:grid-cols-[250px_minmax(0,1fr)]">
    <ProjectSidebar />
    <div className="min-w-0"><Outlet /></div>
  </div>;
}

export default function AppLayout() {
  return <ProjectProvider><AppLayoutContent /></ProjectProvider>;
}
