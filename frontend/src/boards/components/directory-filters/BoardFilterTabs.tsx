import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { TranslationKey } from "../../../common/entities/language";
import type { BoardTab } from "../../utils/boardDashboard";
import type { BoardFiltersProps } from "../../entities/boardFilters";

const tabs: [BoardTab, TranslationKey][] = [
  ["all", "boards.allBoards"],
  ["mine", "boards.myBoards"],
  ["shared", "boards.sharedBoards"],
  ["archived", "boards.archived"],
];

export function BoardFilterTabs({ tab, onTab }: Pick<BoardFiltersProps, "tab" | "onTab">) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-4 border-b border-line">
      {tabs.map(([value, labelKey]) => (
        <button
          key={value}
          type="button"
          aria-pressed={tab === value}
          onClick={() => onTab(value)}
          className={`border-b-2 px-1 pb-2 text-sm font-semibold ${tab === value ? "border-accent text-accent" : "border-transparent text-muted"}`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
