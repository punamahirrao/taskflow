import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";
import { BoardPageHeader, BoardPageTitle } from "../../BoardPageLayout.styles";

export function BoardsDirectoryHeaderLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <BoardPageHeader>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">TaskFlow</p>
        <BoardPageTitle>{t("boards.title")}</BoardPageTitle>
        <p className="mt-2 text-sm text-muted">{t("boards.directorySubtitle")}</p>
      </div>
      {children}
    </BoardPageHeader>
  );
}
