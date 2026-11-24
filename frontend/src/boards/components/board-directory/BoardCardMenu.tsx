import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Archive, MoreVertical, Pencil, Settings2 } from "lucide-react";
import type { BoardCardProps } from "../../entities/boardCard";

export function BoardCardMenu({
  board,
  project,
  menuOpen,
  onMenu,
  onEdit,
  onArchive,
  onProjectSettings,
}: Omit<BoardCardProps, "canManage" | "onOpen">) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("boards.boardOptions", { name: board.name })}
        aria-expanded={menuOpen}
        onClick={onMenu}
        className="rounded-md p-2 text-muted hover:bg-subtle"
      >
        <MoreVertical size={17} />
      </button>
      {menuOpen && (
        <div className="absolute bottom-10 right-0 z-10 w-48 rounded-lg border border-line bg-surface p-1 shadow-lg">
          {(project?.my_role === "owner" || project?.my_role === "admin") && (
            <button
              type="button"
              onClick={onProjectSettings}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-content hover:bg-subtle"
            >
              <Settings2 size={14} />
              {t("boards.configureWorkflow")}
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-content hover:bg-subtle"
          >
            <Pencil size={14} />
            {t("boards.editBoard")}
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-content hover:bg-subtle"
          >
            <Archive size={14} />
            {t("boards.archiveBoard")}
          </button>
        </div>
      )}
    </div>
  );
}
