import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Swimlane } from "../../../common/features/agile/utils/boardView";
import type { TranslationKey } from "../../../common/entities/language";
import { BoardPageSelectField } from "../shared/BoardPageSelectField";

const SWIMLANES: [Swimlane, TranslationKey][] = [
  ["project", "boards.laneProject"],
  ["priority", "boards.lanePriority"],
  ["assignee", "boards.laneAssignee"],
  ["epic", "boards.laneEpic"],
  ["sprint_goal", "boards.laneSprintGoal"],
];

export function BoardSwimlaneSelect({
  value,
  onChange,
}: {
  value: Swimlane;
  onChange: (value: Swimlane) => void;
}) {
  const { t } = useTranslation();
  return (
    <BoardPageSelectField
      id="swimlanes"
      testId="swimlanes"
      label={t("boards.swimlanes")}
      value={value}
      onChange={(next) => onChange(next as Swimlane)}
    >
      {SWIMLANES.map(([id, labelKey]) => (
        <option key={id} value={id}>
          {t(labelKey)}
        </option>
      ))}
    </BoardPageSelectField>
  );
}
