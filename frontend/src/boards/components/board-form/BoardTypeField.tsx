import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardFormProps } from "../../entities/boardForm";
import { BoardSelectField } from "./BoardSelectField";
import type { AgileBoardType } from "../../../features/tasks/entities/task";

export function BoardTypeField({ values, onChange }: Pick<BoardFormProps, "values" | "onChange">) {
  const { t } = useTranslation();
  return (
    <BoardSelectField
      id="board-type"
      testId="board-type"
      label={t("boards.boardType")}
      value={values.type}
      onChange={(event) => onChange({ type: event.target.value as AgileBoardType })}
    >
      <option value="scrum">Scrum</option>
      <option value="kanban">Kanban</option>
    </BoardSelectField>
  );
}
