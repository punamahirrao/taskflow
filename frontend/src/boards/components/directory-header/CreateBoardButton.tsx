import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Plus } from "lucide-react";

export function CreateBoardButton({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onCreate}
      className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
    >
      <Plus size={17} />
      {t("boards.createBoard")}
    </button>
  );
}
