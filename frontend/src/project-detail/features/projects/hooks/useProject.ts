import { useEffect, useState } from "react";
import { getProjects } from "../../../../projects/api/projects";
import type { Project } from "../../../../common/entities/project";
import { translate } from "../../../../common/shared/i18n/translate";

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProjects()
      .then((projects) => {
        if (!active) return;
        const selected = projects.find((item) => item.id === Number(id));
        if (selected) setProject(selected);
        else setError(translate("projectDetail.notFound"));
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : translate("projectDetail.unableToLoadProject"),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return { project, setProject, loading, error };
}
