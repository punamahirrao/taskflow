import { useState } from "react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
}

export function EditableText({
  value,
  onSave,
  placeholder,
  multiline = false,
  type = "text",
}: EditableTextProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  if (!editing)
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="w-full rounded-md py-1 text-left hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        title={t("sprintTrain.clickToEdit")}
      >
        {value || (
          <span className="italic text-slate-400">
            {placeholder ?? t("sprintTrain.clickToAdd")}
          </span>
        )}
      </button>
    );
  const className =
    "w-full rounded-md border border-indigo-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none ring-2 ring-indigo-100";
  return multiline ? (
    <textarea
      autoFocus
      rows={4}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      placeholder={placeholder}
      className={className}
    />
  ) : (
    <input
      autoFocus
      type={type}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        }
        if (event.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}
