import { useCallback, useEffect, useState } from "react";
import { getProjects } from "../../../api/projects";
import type { Project } from "../../../entities/project";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProjects(await getProjects());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  return { projects, loading, error, reload };
}
