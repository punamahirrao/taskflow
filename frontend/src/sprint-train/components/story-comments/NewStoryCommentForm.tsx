import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Send } from "lucide-react";

export function NewStoryCommentForm({
  text,
  saving,
  onText,
  onSubmit,
}: {
  text: string;
  saving: boolean;
  onText: (text: string) => void;
  onSubmit: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="border-t border-slate-200 bg-slate-50 p-4"
    >
      <label
        htmlFor="task-comment-input"
        className="mb-2 block text-xs font-semibold text-slate-700"
      >
        {t("sprintTrain.addComment")}
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="task-comment-input"
          value={text}
          onChange={(event) => onText(event.target.value)}
          rows={3}
          maxLength={10000}
          placeholder={t("sprintTrain.commentPlaceholder")}
          className="min-h-20 flex-1 resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          aria-label={t("sprintTrain.postComment")}
          disabled={saving || !text.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
}
