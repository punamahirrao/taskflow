import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardFormProps } from "../../entities/boardForm";
import { BoardTextareaField } from "./BoardTextareaField";

export function BoardDescriptionField({
  values,
  onChange,
}: Pick<BoardFormProps, "values" | "onChange">) {
  const { t } = useTranslation();
  return (
    <BoardTextareaField
      id="board-description"
      testId="board-description"
      label={t("boards.boardDescription")}
      rows={3}
      value={values.description}
      onChange={(event) => onChange({ description: event.target.value })}
    />
  );
}
