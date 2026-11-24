import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Settings2 } from "lucide-react";

export function BoardConfigureButton({ onConfigure }: { onConfigure: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onConfigure}
      className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-content"
    >
      <Settings2 size={15} />
      {t("boards.configureBoard")}
    </button>
  );
}
