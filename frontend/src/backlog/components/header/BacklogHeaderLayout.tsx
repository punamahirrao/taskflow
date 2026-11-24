import type { ReactNode } from "react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogHeaderLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {t("backlog.title")}
        </h2>
      </div>
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </header>
  );
}
