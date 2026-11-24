import { ArrowRight, CheckCircle2, FileText, LoaderCircle, Trash2, Upload } from "lucide-react";
import type { OrganizationDocument } from "../../../common/entities/document";
import type { Project } from "../../../common/entities/project";
import type { LanguageContextValue } from "../../../common/shared/i18n/context/LanguageContext";
import { EstimatorPanel } from "../../AiEstimatorPage.styles";
import { EstimatorRadioField } from "../shared/EstimatorFields";

type Translate = LanguageContextValue["t"];

interface DocumentSelectionSectionProps {
  project: Project | undefined;
  userId: number | undefined;
  documents: OrganizationDocument[];
  selectedDocument: OrganizationDocument | undefined;
  selectedDocumentId: number | null;
  busy: boolean;
  error: string;
  success: string;
  deletingDocumentId: number | null;
  onUpload: (file: File | undefined) => void;
  onSelectDocument: (id: number) => void;
  onDeleteDocument: (document: OrganizationDocument) => void;
  onStartPipeline: () => void;
  t: Translate;
}

interface EstimatorFileFieldProps {
  disabled: boolean;
  busy: boolean;
  onUpload: (file: File | undefined) => void;
  t: Translate;
}

function EstimatorFileField({ disabled, busy, onUpload, t }: EstimatorFileFieldProps) {
  return (
    <label
      data-testid="estimator-upload-label"
      className={`group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <span className="grid size-12 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
        {busy ? <LoaderCircle className="animate-spin" size={22} /> : <Upload size={22} />}
      </span>
      <span className="mt-3 text-sm font-semibold text-slate-800">
        {busy ? t("aiEstimator.uploading") : t("aiEstimator.clickToUpload")}
      </span>
      <span className="mt-1 text-xs text-slate-500">{t("aiEstimator.fileTypes")}</span>
      <input
        data-testid="estimator-upload-input"
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          onUpload(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
    </label>
  );
}

export function DocumentSelectionSection({
  project,
  userId,
  documents,
  selectedDocument,
  selectedDocumentId,
  busy,
  error,
  success,
  deletingDocumentId,
  onUpload,
  onSelectDocument,
  onDeleteDocument,
  onStartPipeline,
  t,
}: DocumentSelectionSectionProps) {
  return (
    <EstimatorPanel>
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">{t("aiEstimator.chooseDocument")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t("aiEstimator.chooseDocumentHint")}</p>
      </div>
      <EstimatorFileField disabled={!project || busy} busy={busy} onUpload={onUpload} t={t} />
      {!project && (
        <p className="mt-3 text-sm text-amber-700">{t("aiEstimator.selectProjectBeforeUpload")}</p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          <CheckCircle2 size={16} />
          {success}
        </p>
      )}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            {t("aiEstimator.chooseFromDocuments")}
          </h3>
          <span className="text-xs text-slate-400">
            {t("aiEstimator.filesCount", { count: documents.length })}
          </span>
        </div>
        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
          {documents.map((document) => {
            const canDelete =
              document.owner === userId ||
              project?.my_role === "owner" ||
              project?.my_role === "admin";
            const inputId = `estimator-document-${document.id}`;
            return (
              <div
                key={document.id}
                className={`flex items-center gap-3 p-4 transition ${selectedDocumentId === document.id ? "bg-indigo-50" : "hover:bg-slate-50"}`}
              >
                <EstimatorRadioField
                  id={inputId}
                  testId={`estimator-document-${document.id}`}
                  label={t("aiEstimator.selectDocument", { name: document.name })}
                  name="estimator-document"
                  checked={selectedDocumentId === document.id}
                  onChange={() => onSelectDocument(document.id)}
                  className="accent-indigo-600"
                />
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-500">
                  <FileText size={18} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                  {document.name}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {t("aiEstimator.fileSize", { size: (document.size / 1024).toFixed(0) })}
                </span>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteDocument(document)}
                    disabled={deletingDocumentId === document.id}
                    title={t("aiEstimator.deleteDocument", { name: document.name })}
                    aria-label={t("aiEstimator.deleteDocument", { name: document.name })}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-50"
                  >
                    {deletingDocumentId === document.id ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            );
          })}
          {project && documents.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500">{t("aiEstimator.noDocuments")}</p>
          )}
          {!project && (
            <p className="p-6 text-center text-sm text-slate-500">
              {t("aiEstimator.selectProjectToSeeDocuments")}
            </p>
          )}
        </div>
      </div>
      <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
        <p className="truncate pr-3 text-sm text-slate-500">
          {selectedDocument ? (
            <>
              {t("aiEstimator.selected")}{" "}
              <span className="font-medium text-slate-800">{selectedDocument.name}</span>
            </>
          ) : (
            t("aiEstimator.noFileSelected")
          )}
        </p>
        <button
          type="button"
          onClick={onStartPipeline}
          disabled={!selectedDocument}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {t("aiEstimator.next")}
          <ArrowRight size={16} />
        </button>
      </div>
    </EstimatorPanel>
  );
}
