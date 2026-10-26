import { useEffect, useState } from "react";
import { getProjects } from "../../../api/projects";
import type { Project } from "../../../entities/project";

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProjects().then((projects) => {
      if (!active) return;
      const selected = projects.find((item) => item.id === Number(id));
      if (selected) setProject(selected);
      else setError("Project not found.");
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to load project.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return { project, loading, error };
}
