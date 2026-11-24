import { Search } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        aria-label={t("backlog.searchAria")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("backlog.findWork")}
        className="w-44 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
      />
    </div>
  );
}
