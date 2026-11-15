import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type { Project } from "../../../entities/project";
import { useAppDispatch, useAppSelector } from "../../../store";
import { loadProjects, projectActions, saveDefaultProject } from "../../../store/projectsSlice";
import { ProjectContext } from "./ProjectContext";

interface ProjectProviderProps { children: ReactNode }
export function ProjectProvider({ children }: ProjectProviderProps) {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { projects, loading, error, selected } = useAppSelector((state) => state.projects);
  useEffect(() => { void dispatch(loadProjects()); }, [dispatch]);

  const reload = useCallback(async () => { await dispatch(loadProjects()).unwrap(); }, [dispatch]);
  const select = useCallback((projectId: number | null) => { dispatch(projectActions.projectSelected(projectId)); }, [dispatch]);
  const setDefault = useCallback(async (projectId: number | null) => { await dispatch(saveDefaultProject(projectId)).unwrap(); }, [dispatch]);
  const selectedId = useMemo(() => {
    const routeId = /^\/project\/(\d+)/.exec(pathname)?.[1];
    const exists = (id: number) => projects.some((project) => project.id === id);
    if (routeId && exists(Number(routeId))) return Number(routeId);
    if (selected === "all") return null;
    if (selected && exists(Number(selected))) return Number(selected);
    return projects.find((project) => project.is_default)?.id ?? null;
  }, [pathname, projects, selected]);
  const value = useMemo(() => ({ projects: projects as Project[], loading, error, reload, selectedId, select, setDefault }), [projects, loading, error, reload, selectedId, select, setDefault]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
