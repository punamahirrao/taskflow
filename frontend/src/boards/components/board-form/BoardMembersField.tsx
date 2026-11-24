import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ProjectMember } from "../../../common/entities/project";
import type { BoardFormProps } from "../../entities/boardForm";
import { BoardSelectField } from "./BoardSelectField";

export function BoardMembersField({
  members,
  values,
  onChange,
}: Pick<BoardFormProps, "values" | "onChange"> & { members: ProjectMember[] }) {
  const { t } = useTranslation();
  return (
    <BoardSelectField
      id="board-members"
      testId="board-members"
      label={t("boards.members")}
      multiple
      value={values.members.map(String)}
      className="h-28"
      onChange={(event) =>
        onChange({
          members: Array.from(event.target.selectedOptions, (option) => Number(option.value)),
        })
      }
    >
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.first_name} {member.last_name} ({member.email})
        </option>
      ))}
    </BoardSelectField>
  );
}
