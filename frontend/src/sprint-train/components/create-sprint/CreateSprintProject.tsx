import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Project } from "../../../common/entities/project";

export function CreateSprintProject({ project }: { project: Project | null }) {
  const { t } = useTranslation();
  return project ? (
    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
      {t("app.project")}: <span className="font-semibold">{project.name}</span>
    </p>
  ) : (
    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      {t("sprintTrain.errorChooseProjectAndName")}
    </p>
  );
}
