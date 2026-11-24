import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardCardProps } from "../../entities/boardCard";

export function BoardCardMetrics({ board }: Pick<BoardCardProps, "board">) {
  const { t } = useTranslation();
  return (
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
  );
}
