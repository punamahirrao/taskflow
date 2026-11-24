import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function QuickCaptureProject({ project }: { project?: Project }) {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-slate-600">
      {project ? (
        <>
          {t("backlog.project")}: <span className="font-semibold">{project.name}</span>
        </>
      ) : (
        t("backlog.selectProject")
      )}
    </p>
  );
}
