import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";
import { BoardPageHeader } from "../../BoardPageLayout.styles";

export function BoardWorkspaceHeaderLayout({
  children,
  name,
}: {
  children: ReactNode;
  name?: string;
}) {
  const { t } = useTranslation();
  return (
    <BoardPageHeader $workspace>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-info">
          {t("boards.eyebrow")}
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-content">
          {name ?? t("boards.title")}
        </h2>
      </div>
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </BoardPageHeader>
  );
}
