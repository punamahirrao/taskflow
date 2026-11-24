import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";

export function BacklogDrawerFrame({
  children,
  creating,
}: {
  children: ReactNode;
  creating: boolean;
}) {
  const { t } = useTranslation();
  return (
    <aside
      aria-label={t("sprintTrain.globalBacklogDrawerAria")}
      className={`sprint-backlog-drawer border-l shadow-2xl ${creating ? "is-creating-story" : ""}`}
    >
      {children}
    </aside>
  );
}
