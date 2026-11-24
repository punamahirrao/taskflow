import type { ReactNode } from "react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogGroupSection({ name, children }: { name: string; children: ReactNode }) {
  const { t } = useTranslation();
  return <section aria-label={t("backlog.groupAria", { name })}>{children}</section>;
}
