import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function CommentEditor({
  text,
  saving,
  onText,
  onCancel,
  onSave,
}: {
  text: string;
  saving: boolean;
  onText: (text: string) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-3 space-y-2">
      <textarea
        autoFocus
        value={text}
        onChange={(event) => onText(event.target.value)}
        rows={3}
        maxLength={10000}
        className="w-full rounded-lg border border-indigo-300 p-2.5 text-sm outline-none ring-2 ring-indigo-100"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          {t("sprintTrain.cancel")}
        </button>
        <button
          type="button"
          disabled={saving || !text.trim()}
          onClick={() => void onSave()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {t("sprintTrain.saveEdit")}
        </button>
      </div>
    </div>
  );
}
