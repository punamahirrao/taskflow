import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";

export function BoardColumnLayout({ name, children }: { name: string; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <section
      aria-label={t("boards.columnAria", { name })}
      className="flex h-full min-w-0 flex-col rounded-xl border border-line bg-subtle/80 p-2.5 transition hover:border-accent/30"
    >
      {children}
    </section>
  );
}
