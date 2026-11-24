import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";

export function SprintPipelineSection({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <section aria-label={t("sprintTrain.sprintPipeline")} className="sprint-pipeline">
      {children}
    </section>
  );
}
