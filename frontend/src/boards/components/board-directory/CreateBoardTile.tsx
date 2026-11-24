import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Plus } from "lucide-react";

export function CreateBoardTile({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onCreate}
      className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-accent/40 bg-surface p-8 text-center hover:bg-accent/5"
    >
      <span>
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
          <Plus />
        </span>
        <b className="block text-content">{t("boards.createNewBoard")}</b>
        <small className="mt-2 block text-muted">{t("boards.createBoardHint")}</small>
      </span>
    </button>
  );
}
