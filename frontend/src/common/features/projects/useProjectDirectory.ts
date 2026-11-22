import { useCallback, useEffect, useState } from "react";
import { searchProjectDirectory, type ProjectDirectoryEntry } from "../../../projects/api/projects";

export function useProjectDirectory(query: string, enabled = true) {
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const [state, setState] = useState<{
    projects: ProjectDirectoryEntry[];
    loading: boolean;
    error: string;
  }>({ projects: [], loading: enabled, error: "" });
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setState({ projects: [], loading: true, error: "" });
      searchProjectDirectory(query)
        .then((projects) => {
          if (active) setState({ projects, loading: false, error: "" });
        })
        .catch((error: unknown) => {
          if (active)
            setState({
              projects: [],
              loading: false,
              error: error instanceof Error ? error.message : "Unable to search projects.",
            });
        });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, enabled, version]);
  return { ...state, reload };
}
