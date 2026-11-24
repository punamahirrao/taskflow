import type { useDocumentLibraryPageModel } from "../../features/library/useDocumentLibraryPageModel";

export function DocumentUploadHint({
  model,
}: {
  model: ReturnType<typeof useDocumentLibraryPageModel>;
}) {
  const { t, dragging, library } = model;
  return (
    <div
      className={`border-b border-slate-100 px-5 py-3 text-xs ${dragging ? "bg-sky-50 text-sky-800" : "bg-slate-50/70 text-slate-500"}`}
    >
      {dragging
        ? t("documents.dropToUpload")
        : library.busy
          ? t("documents.savingFiles")
          : t("documents.dropHint")}
    </div>
  );
}
