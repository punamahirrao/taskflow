import { useState } from "react";
import { FolderPlus, Link2, X } from "lucide-react";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { firstValidationError, documentFolderSchema, resourceLinkSchema } from "../../common/validation/schemas";
import { useToast } from "../../common/features/notifications/useToast";

interface DocumentCreationFormsProps {
  showFolder: boolean; showLink: boolean; busy: boolean; personal: boolean;
  onCreateFolder: (name: string) => Promise<boolean>; onSaveLink: (name: string, url: string) => Promise<boolean>;
  onCloseFolder: () => void; onCloseLink: () => void;
}

export function DocumentCreationForms({ showFolder, showLink, busy, personal, onCreateFolder, onSaveLink, onCloseFolder, onCloseLink }: DocumentCreationFormsProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [folderName, setFolderName] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [validationError, setValidationError] = useState("");
  async function submitFolder() { const error = firstValidationError(documentFolderSchema, { name: folderName }); if (error) { setValidationError(error); toast("error", error); return; } if (await onCreateFolder(folderName.trim())) { setFolderName(""); setValidationError(""); onCloseFolder(); toast("success", t("documents.folderCreatedToast")); } }
  async function submitLink() { const error = firstValidationError(resourceLinkSchema, { name: linkName, url: linkUrl }); if (error) { setValidationError(error); toast("error", error); return; } if (await onSaveLink(linkName.trim(), linkUrl.trim())) { setLinkName(""); setLinkUrl(""); setValidationError(""); onCloseLink(); toast("success", t("documents.linkSavedToast")); } }
  return <>
    {validationError && <p role="alert" className="px-5 py-2 text-sm text-danger">{validationError}</p>}
    {showFolder && <form onSubmit={(event) => { event.preventDefault(); void submitFolder(); }} className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-sky-50/60 px-5 py-3"><FolderPlus size={16} className="text-sky-600" /><input autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder={t("documents.folderNamePlaceholder")} aria-label={t("documents.newFolderName")} className="min-w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><button disabled={busy || !folderName.trim()} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{t("documents.createFolder")}</button><button type="button" onClick={() => { setFolderName(""); onCloseFolder(); }} className="rounded-lg p-2 text-slate-400 hover:bg-white" aria-label={t("documents.cancel")}><X size={15} /></button>{personal && <span className="text-[10px] text-slate-500">{t("documents.onlyYouFolder")}</span>}</form>}
    {showLink && <form onSubmit={(event) => { event.preventDefault(); void submitLink(); }} className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-indigo-50/60 px-5 py-3"><Link2 size={16} className="text-indigo-600" /><input autoFocus value={linkName} onChange={(event) => setLinkName(event.target.value)} placeholder={t("documents.resourceName")} aria-label={t("documents.resourceName")} className="min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><input type="url" required value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder={t("documents.urlPlaceholder")} aria-label={t("documents.resourceUrl")} className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><button disabled={busy || !linkName.trim() || !linkUrl.trim()} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{t("documents.saveResource")}</button><button type="button" onClick={() => { setLinkName(""); setLinkUrl(""); onCloseLink(); }} className="rounded-lg p-2 text-slate-400 hover:bg-white" aria-label={t("documents.cancel")}><X size={15} /></button><span className="w-full pl-6 text-[10px] text-slate-500">{t("documents.quickLinksHint")}</span></form>}
  </>;
}
