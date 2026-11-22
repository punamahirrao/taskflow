import { useCallback, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type { Project } from "../../../entities/project";
import { useAppDispatch, useAppSelector } from "../../../store";

import { saveProjectSelection } from "../../../../projects/store/projectSelectionSlice";
import {
  useAccessibleProjectsQuery,
  useSetDefaultProjectMutation,
} from "../../../../projects/api/projectsQuery";
import { dataScope, unwrapRequest } from "../../../api/queryApi";
import { translate } from "../../../shared/i18n/translate";

const emptyProjects: Project[] = [];

import { ProjectContext } from "./ProjectContext";

interface ProjectProviderProps {
  children: ReactNode;
}
export function ProjectProvider({ children }: ProjectProviderProps) {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.projectSelection.selected);
  const query = useAccessibleProjectsQuery(dataScope());
  const [saveDefaultProject] = useSetDefaultProjectMutation();
  const projects = query.currentData ?? emptyProjects;
  const loading = query.isLoading;
  const error = query.error
    ? ("message" in query.error && query.error.message) || translate("projectSwitcher.loadFailed")
    : "";
  const refetch = query.refetch;
  const reload = useCallback(async () => {
    await unwrapRequest(refetch(), translate("projectSwitcher.loadFailed"));
  }, [refetch]);
  const select = useCallback(
    (projectId: number | null) => dispatch(saveProjectSelection(projectId)),
    [dispatch],
  );
  const setDefault = useCallback(
    async (projectId: number | null) => {
      await unwrapRequest(
        saveDefaultProject(projectId),
        translate("projects.unableToUpdateDefault"),
      );
      await unwrapRequest(refetch(), translate("projectSwitcher.loadFailed"));
    },
    [refetch, saveDefaultProject],
  );
  const selectedId = useMemo(() => {
    const routeId = /^\/project\/(\d+)/.exec(pathname)?.[1];
    const exists = (id: number) => projects.some((project) => project.id === id);
    if (routeId && exists(Number(routeId))) return Number(routeId);
    if (selected === "all") return null;
    if (selected && exists(Number(selected))) return Number(selected);
    return projects.find((project) => project.is_default)?.id ?? null;
  }, [pathname, projects, selected]);
  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      reload,
      selectedId,
      select,
      setDefault,
    }),
    [projects, loading, error, reload, selectedId, select, setDefault],
  );
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
