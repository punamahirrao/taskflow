import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";

export function StoryHistoryLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <p className="mb-4 text-xs text-slate-500">{t("sprintTrain.historyHint")}</p>
      {children}
    </div>
  );
}
