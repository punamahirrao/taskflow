import { Folder } from "lucide-react";
import type { DocumentFolder, ResourceLink, WorkspaceDocument } from "../../common/entities/document";
import { FileRow, FolderRow, ResourceRow } from "./DocumentRows";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface DocumentLibraryContentProps {
  loading: boolean; folders: DocumentFolder[]; documents: WorkspaceDocument[]; links: ResourceLink[];
  canManage: (ownerId: number | null) => boolean; onOpenFolder: (folder: DocumentFolder) => void;
  onRenameFolder: (folder: DocumentFolder) => void; onDeleteFolder: (folder: DocumentFolder) => void;
  onDownload: (document: WorkspaceDocument) => void; onDeleteDocument: (document: WorkspaceDocument) => void; onDeleteLink: (link: ResourceLink) => void;
}

export function DocumentLibraryContent({ loading, folders, documents, links, canManage, onOpenFolder, onRenameFolder, onDeleteFolder, onDownload, onDeleteDocument, onDeleteLink }: DocumentLibraryContentProps) {
  const { t } = useTranslation();
  if (loading) return <div className="p-14 text-center text-sm text-slate-500">{t("documents.opening")}</div>;
  if (!folders.length && !documents.length && !links.length) return <div className="p-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"><Folder size={21} /></div><h3 className="mt-3 font-semibold text-slate-900">{t("documents.emptyTitle")}</h3><p className="mt-1 text-sm text-slate-500">{t("documents.emptyHint")}</p></div>;
  return <div className="divide-y divide-slate-100">{folders.map((folder) => <FolderRow key={folder.id} folder={folder} canManage={canManage(folder.owner)} onOpen={() => onOpenFolder(folder)} onRename={() => onRenameFolder(folder)} onDelete={() => onDeleteFolder(folder)} />)}{links.map((link) => <ResourceRow key={`link-${link.id}`} name={link.name} url={link.url} location={link.project_name ?? t("documents.myPrivateLinks")} canManage={canManage(link.owner)} onDelete={() => onDeleteLink(link)} />)}{documents.map((document) => <FileRow key={document.id} document={document} canManage={canManage(document.owner)} onDownload={() => onDownload(document)} onDelete={() => onDeleteDocument(document)} />)}</div>;
}
