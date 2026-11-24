import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { AlertTriangle } from "lucide-react";

export function BoardBlockedNotice({ count }: { count: number }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      <AlertTriangle size={16} />
      {t(count === 1 ? "boards.blockedOne" : "boards.blockedMany", { count })}
    </div>
  );
}
