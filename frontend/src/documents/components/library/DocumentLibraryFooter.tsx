import type { useDocumentLibraryPageModel } from "../../features/library/useDocumentLibraryPageModel";

export function DocumentLibraryFooter({
  model,
}: {
  model: ReturnType<typeof useDocumentLibraryPageModel>;
}) {
  const { t, folders, documents, links } = model;
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-400">
      <span>
        {t("documents.footerCounts", {
          folders: folders.length,
          documents: documents.length,
          links: links.length,
        })}
      </span>
      <span>{t("documents.footerNote")}</span>
    </footer>
  );
}
