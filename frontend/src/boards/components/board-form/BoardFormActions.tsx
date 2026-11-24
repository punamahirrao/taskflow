import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardFormProps } from "../../entities/boardForm";

export function BoardFormActions({ busy, onCancel }: Pick<BoardFormProps, "busy" | "onCancel">) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-line px-4 py-2 text-sm text-content"
      >
        {t("common.cancel")}
      </button>
      <button
        disabled={busy}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? t("common.saving") : t("common.save")}
      </button>
    </div>
  );
}
