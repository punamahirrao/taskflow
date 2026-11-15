import { useCallback, useEffect } from "react";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { useAppDispatch, useAppSelector } from "../../../common/store";
import { loadDashboardStats } from "../../../common/store/dashboardSlice";

export function useDashboardStats() {
  const dispatch = useAppDispatch();
  const { projects, loading: projectsLoading, selectedId } = useProjectContext();
  const state = useAppSelector((store) => store.dashboard);
  const projectIds = projects.map((project) => project.id).join(",");
  useEffect(() => { if (!projectsLoading) void dispatch(loadDashboardStats({ projects, selectedId })); }, [dispatch, projectsLoading, projectIds, selectedId]);
  const retry = useCallback(() => { void dispatch(loadDashboardStats({ projects, selectedId })); }, [dispatch, projects, selectedId]);
  return { ...state, retry };
}
