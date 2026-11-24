import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { AgileBoard } from "../../../features/tasks/entities/task";
import { BoardPageSelectField } from "../shared/BoardPageSelectField";

export function BoardChooser({
  boards,
  selectedId,
  onChange,
}: {
  boards: AgileBoard[];
  selectedId?: number;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <BoardPageSelectField
      id="choose-board"
      testId="choose-board"
      label={t("boards.chooseBoard")}
      value={String(selectedId ?? "")}
      onChange={onChange}
    >
      {boards.map((board) => (
        <option key={board.id} value={board.id}>
          {board.name}
        </option>
      ))}
    </BoardPageSelectField>
  );
}
