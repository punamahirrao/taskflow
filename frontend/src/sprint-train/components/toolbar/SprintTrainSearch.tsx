import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Search } from "lucide-react";

export function SprintTrainSearch({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="relative min-w-44 flex-1 lg:flex-none">
      <span className="sr-only">{t("sprintTrain.searchStoriesAndSprints")}</span>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={t("sprintTrain.searchStoriesPlaceholder")}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}
