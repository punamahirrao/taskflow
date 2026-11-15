import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { createAgileBoardColumn, createProjectBoardColumn, createWorkflowStatus, deleteAgileBoardColumn, deleteBoardColumn, deleteWorkflowStatus, getAgileBoardWorkflow, getProjectWorkflow, updateAgileBoardColumn, updateBoardColumn, updateWorkflowStatus } from "../api/tasks";
import type { BoardColumn, ProjectWorkflow } from "../../common/entities/task";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { firstValidationError, nameSchema } from "../../common/validation/schemas";
import { useToast } from "../../common/features/notifications/useToast";

interface WorkflowConfigDialogProps {
  projectId: number;
  boardId?: number;
  onClose: () => void;
  onSaved: () => void;
}

export function WorkflowConfigDialog({ projectId, boardId, onClose, onSaved }: WorkflowConfigDialogProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [statusName, setStatusName] = useState("");
  const [columnName, setColumnName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const boardMode = boardId !== undefined;
  async function loadWorkflow() { return boardMode ? getAgileBoardWorkflow(projectId, boardId!) : getProjectWorkflow(projectId); }

  async function reload() {
    const result = await loadWorkflow();
    setWorkflow(result);
  }

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(loadWorkflow).then((result) => {
      if (!active) return;
      setWorkflow(result);
    }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : t("boards.errLoadWorkflow")); });
    return () => { active = false; };
  }, [projectId, boardId, t]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      const target = event.target;
      document.querySelectorAll<HTMLDetailsElement>("details[data-column-status-menu]").forEach((menu) => {
        if (menu.open && !menu.contains(target)) menu.open = false;
      });
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await action(); await reload(); onSaved(); toast("success", t("boards.workflowSaved")); }
    catch (cause) { const message = cause instanceof Error ? cause.message : t("boards.errLoadWorkflow"); setError(message); toast("error", message); }
    finally { setBusy(false); }
  }

  async function saveColumn(column: BoardColumn, changes: Partial<BoardColumn> & { status_ids?: number[] }) {
    await run(async () => { if (boardMode) await updateAgileBoardColumn(projectId, boardId!, column.id, changes); else await updateBoardColumn(projectId, column.id, changes); });
  }

  async function moveColumn(column: BoardColumn, direction: -1 | 1) {
    if (!workflow) return;
    const ordered = [...workflow.columns].sort((a, b) => a.position - b.position);
    const index = ordered.findIndex((item) => item.id === column.id);
    const other = ordered[index + direction];
    if (!other) return;
    await run(async () => {
      const update = (id: number, position: number) => boardMode ? updateAgileBoardColumn(projectId, boardId!, id, { position }) : updateBoardColumn(projectId, id, { position });
      await update(column.id, other.position);
      await update(other.id, column.position);
    });
  }

  const orderedColumns = [...(workflow?.columns ?? [])].sort((a, b) => a.position - b.position);
  const orderedStatuses = [...(workflow?.statuses ?? [])].sort((a, b) => a.position - b.position);
  const builtInKeys = new Set(["todo", "in_progress", "done"]);
  const mappedColumnByStatus = new Map(orderedColumns.flatMap((column) => column.statuses.map((status) => [status.id, column.id] as const)));
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="workflow-config-title" className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-violet-600">{t(boardMode ? "boards.boardConfigEyebrow" : "boards.workflowConfigEyebrow")}</p><h2 id="workflow-config-title" className="mt-1 text-xl font-bold text-slate-900">{t(boardMode ? "boards.boardConfigTitle" : "boards.workflowConfigTitle")}</h2><p className="mt-1 text-sm text-slate-500">{t(boardMode ? "boards.boardConfigHint" : "boards.workflowConfigHint")}</p></div><button type="button" aria-label={t("boards.closeWorkflowConfig")} disabled={busy} onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></header>
      <div className="min-h-0 overflow-y-auto p-6">
        {!boardMode && <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={(event) => { event.preventDefault(); const issue = firstValidationError(nameSchema, { name: statusName }); if (issue) { setError(issue); toast("error", issue); return; } void run(async () => { await createWorkflowStatus(projectId, statusName.trim()); setStatusName(""); }); }} className="flex w-full max-w-sm shrink-0 gap-2">
              <input required value={statusName} onChange={(event) => setStatusName(event.target.value)} placeholder={t("boards.statusNamePlaceholder")} aria-label={t("boards.statusNamePlaceholder")} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"/>
              <button disabled={busy || !statusName.trim()} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Plus size={14}/>{t("boards.addStatus")}</button>
            </form>
            {orderedStatuses.map((status) => <div key={status.id} className="inline-flex max-w-full items-center gap-1 rounded-full border border-violet-200 bg-white px-2 py-1">
            <input aria-label={t("boards.statusNameAria", { name: status.name })} defaultValue={status.name} key={`${status.id}-${status.name}`} disabled={busy || boardMode || builtInKeys.has(status.key) || !workflow?.can_manage} onBlur={(event) => { if (event.target.value.trim() && event.target.value.trim() !== status.name) void run(() => updateWorkflowStatus(projectId, status.id, { name: event.target.value.trim() })); }} className="w-28 min-w-0 bg-transparent px-1 text-xs font-medium text-slate-800 outline-none disabled:cursor-default" />
              {!boardMode && !builtInKeys.has(status.key) && workflow?.can_manage && <button type="button" title={t("boards.deleteWorkflowStatus")} aria-label={t("boards.deleteWorkflowStatusAria", { name: status.name })} disabled={busy} onClick={() => { const replacement = orderedStatuses.find((candidate) => candidate.id !== status.id); void run(() => deleteWorkflowStatus(projectId, status.id, replacement?.key)); }} className="rounded-full p-1 text-rose-400 hover:bg-rose-50 disabled:opacity-40"><X size={13}/></button>}
              {builtInKeys.has(status.key) && <span className="px-1 text-[10px] text-slate-400">{t("boards.builtInStatus")}</span>}
            </div>)}
          </div>
        </section>}
        <section><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">{t("boards.boardColumns")}</h3><span className="text-xs text-slate-400">{t("boards.columnCount", { count: orderedColumns.length })}</span></div><div className="space-y-3">{orderedColumns.map((column, index) => <div key={column.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center gap-2"><input aria-label={t("boards.columnNameAria", { name: column.name })} defaultValue={column.name} key={`${column.id}-${column.name}`} disabled={busy || (!boardMode && builtInKeys.has(column.key)) || !workflow?.can_manage} onBlur={(event) => { if (event.target.value.trim() && event.target.value.trim() !== column.name) void saveColumn(column, { name: event.target.value.trim() }); }} className="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1.5 text-sm font-semibold text-slate-800 hover:border-slate-200 focus:border-violet-300"/><button type="button" title={t("boards.moveColumnUp")} aria-label={t("boards.moveColumnUp")} disabled={busy || index === 0} onClick={() => void moveColumn(column, -1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15}/></button><button type="button" title={t("boards.moveColumnDown")} aria-label={t("boards.moveColumnDown")} disabled={busy || index === orderedColumns.length - 1} onClick={() => void moveColumn(column, 1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15}/></button><button type="button" title={t("boards.removeColumn")} aria-label={t("boards.removeColumn")} disabled={busy || !workflow?.can_manage || (boardMode ? orderedColumns.length <= 1 : builtInKeys.has(column.key) || column.statuses.length > 0)} onClick={() => { if (boardMode && column.statuses.length) { const destination = orderedColumns.find((item) => item.id !== column.id && item.statuses.length); if (!destination) { setError(t("boards.deleteLastMappedColumn")); return; } if (window.confirm(t("boards.confirmDeleteColumn", { name: column.name, destination: destination.name }))) void run(() => deleteAgileBoardColumn(projectId, boardId!, column.id, destination.key)); } else void run(() => deleteBoardColumn(projectId, column.id)); }} className="rounded p-1 text-rose-400 hover:bg-rose-50 disabled:opacity-30"><Trash2 size={14}/></button></div><div className="mt-3"><span className="text-xs font-semibold text-slate-600">{t("boards.columnStatuses")}</span><details data-column-status-menu className="group relative mt-1"><summary aria-label={t("boards.columnStatusesFor", { name: column.name })} className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><span className="truncate">{column.statuses.length ? column.statuses.map((status) => status.name).join(", ") : t("boards.selectColumnStatuses")}</span><span className="ml-2 text-slate-400">▾</span></summary><div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl">{orderedStatuses.filter((status) => !mappedColumnByStatus.has(status.id) || mappedColumnByStatus.get(status.id) === column.id).map((status) => <label key={status.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"><input type="checkbox" disabled={busy} checked={column.statuses.some((item) => item.id === status.id)} onChange={(event) => { const current = new Set(column.statuses.map((item) => item.id)); if (event.target.checked) current.add(status.id); else current.delete(status.id); void saveColumn(column, { status_ids: [...current] }); }}/><span>{status.name}</span></label>)}</div></details><p className="mt-1 text-[10px] text-slate-400">{t("boards.columnStatusesHint")}</p></div></div>)}</div>
          <form onSubmit={(event) => { event.preventDefault(); const issue = firstValidationError(nameSchema, { name: columnName }); if (issue) { setError(issue); toast("error", issue); return; } void run(async () => { const position = orderedColumns.reduce((highest, column) => Math.max(highest, column.position), -1) + 1; if (boardMode) await createAgileBoardColumn(projectId, boardId!, { name: columnName.trim(), position }); else await createProjectBoardColumn(projectId, { name: columnName.trim(), create_empty: true, position }); setColumnName(""); }); }} className="mt-3 flex gap-2"><input value={columnName} onChange={(event) => setColumnName(event.target.value)} placeholder={t("boards.columnNamePlaceholder")} aria-label={t("boards.columnNamePlaceholder")} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"/><button disabled={busy || !columnName.trim() || !workflow?.can_manage} className="inline-flex items-center gap-1 rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700 disabled:opacity-40"><Plus size={14}/>{t("boards.addColumn")}</button></form>
        </section>
      </div>
      {error && <p role="alert" className="mx-6 mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <footer className="flex justify-end border-t border-slate-100 px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{t("boards.doneWorkflowConfig")}</button></footer>
    </section>
  </div>;
}
