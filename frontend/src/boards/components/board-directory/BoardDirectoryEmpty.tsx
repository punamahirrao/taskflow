import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardDirectoryEmpty({ archived }: { archived: boolean }) {
  const { t } = useTranslation();
  return (
    <p className="rounded-xl border border-line bg-surface p-12 text-center text-sm text-muted">
      {t(archived ? "boards.noArchivedBoards" : "boards.noBoards")}
    </p>
  );
}
