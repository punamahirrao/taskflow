import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getProjects, setDefaultProject } from "../../../api/projects";
import type { Project } from "../../../entities/project";
import { ProjectContext } from "./ProjectContext";

const STORAGE_KEY = "selected_project";
const ALL = "all";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stored, setStored] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));

  const reload = useCallback(async () => {
    try {
      setProjects(await getProjects());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => { if (active) setProjects(data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load projects."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const select = useCallback((projectId: number | null) => {
    const value = projectId === null ? ALL : String(projectId);
    sessionStorage.setItem(STORAGE_KEY, value);
    setStored(value);
  }, []);

  const setDefault = useCallback(async (projectId: number | null) => {
    await setDefaultProject(projectId);
    setProjects((current) => current.map((project) => ({ ...project, is_default: project.id === projectId })));
  }, []);

  const selectedId = useMemo(() => {
    const routeId = /^\/project\/(\d+)/.exec(pathname)?.[1];
    const exists = (id: number) => projects.some((project) => project.id === id);
    if (routeId && exists(Number(routeId))) return Number(routeId);
    if (stored === ALL) return null;
    if (stored && exists(Number(stored))) return Number(stored);
    return projects.find((project) => project.is_default)?.id ?? null;
  }, [pathname, projects, stored]);

  const value = useMemo(
    () => ({ projects, loading, error, reload, selectedId, select, setDefault }),
    [projects, loading, error, reload, selectedId, select, setDefault],
  );
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
