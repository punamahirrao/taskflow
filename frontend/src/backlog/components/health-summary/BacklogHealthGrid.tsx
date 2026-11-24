import type { ReactNode } from "react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogHealthGrid({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <section
      className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      aria-label={t("backlog.healthLabel")}
    >
      {children}
    </section>
  );
}
