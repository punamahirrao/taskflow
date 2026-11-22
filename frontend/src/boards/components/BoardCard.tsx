import { Archive, Columns3, MoreVertical, Pencil, Settings2 } from "lucide-react";
import type { AgileBoard } from "../../features/tasks/entities/task";
import type { Project } from "../../common/entities/project";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface Props {
  board: AgileBoard;
  project?: Project;
  canManage: boolean;
  menuOpen: boolean;
  onOpen: () => void;
  onMenu: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onProjectSettings: () => void;
}
export function BoardCard({
  board,
  project,
  canManage,
  menuOpen,
  onOpen,
  onMenu,
  onEdit,
  onArchive,
  onProjectSettings,
}: Props) {
  const { t } = useTranslation();
  return (
    <article className="relative flex min-h-64 flex-col rounded-2xl border border-line bg-surface shadow-sm">
      <button type="button" onClick={onOpen} className="flex flex-1 flex-col p-5 text-left">
        <div className="flex items-start gap-4">
          <span className="grid size-14 place-items-center rounded-xl bg-accent/10 text-accent">
            <Columns3 size={25} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-lg font-bold text-content">{board.name}</span>
            <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span
                className={`rounded-md px-2 py-1 font-semibold ${board.board_type === "scrum" ? "bg-accent/10 text-accent" : "bg-warning-soft text-warning"}`}
              >
                {board.board_type === "scrum" ? "Scrum" : "Kanban"}
              </span>
              <span>{project?.name ?? `Project ${board.project}`}</span>
            </span>
          </span>
        </div>
        <span className="mt-4 line-clamp-2 min-h-10 text-sm text-muted">{board.description}</span>
        <span className="mt-auto grid grid-cols-3 border-t border-line pt-4 text-center">
          <span>
            <b className="block text-base text-content">{board.sprint_count}</b>
            <small className="text-xs text-muted">{t("boards.sprints")}</small>
          </span>
          <span className="border-x border-line">
            <b className="block text-base text-content">{board.task_count}</b>
            <small className="text-xs text-muted">{t("boards.tasks")}</small>
          </span>
          <span>
            <b className="block text-base text-content">{board.member_count}</b>
            <small className="text-xs text-muted">{t("boards.members")}</small>
          </span>
        </span>
        <small className="mt-3 text-xs text-muted">
          {t("boards.lastUpdated", { date: new Date(board.updated_at).toLocaleDateString() })}
        </small>
      </button>
      <footer className="flex items-center justify-between border-t border-line px-5 py-3">
        <div className="flex -space-x-2">
          {board.members.slice(0, 4).map((member) => (
            <span
              key={member.id}
              title={member.name}
              className="grid size-8 place-items-center overflow-hidden rounded-full border-2 border-surface bg-subtle text-[calc(10px*var(--taskflow-font-scale,1))] font-bold text-content"
            >
              {member.photo_url ? (
                <img src={member.photo_url} alt="" className="size-full object-cover" />
              ) : (
                member.name.slice(0, 2).toUpperCase()
              )}
            </span>
          ))}
          {board.member_count > 4 && (
            <span className="grid size-8 place-items-center rounded-full border-2 border-surface bg-subtle text-[calc(10px*var(--taskflow-font-scale,1))] text-content">
              +{board.member_count - 4}
            </span>
          )}
        </div>
        {canManage && (
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
        )}
      </footer>
    </article>
  );
}
