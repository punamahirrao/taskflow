import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardFormProps } from "../../entities/boardForm";
import { BoardTextField } from "./BoardTextField";

export function BoardNameField({ values, onChange }: Pick<BoardFormProps, "values" | "onChange">) {
  const { t } = useTranslation();
  return (
    <BoardTextField
      id="board-name"
      testId="board-name"
      label={t("boards.boardName")}
      required
      maxLength={100}
      value={values.name}
      onChange={(event) => onChange({ name: event.target.value })}
    />
  );
}
