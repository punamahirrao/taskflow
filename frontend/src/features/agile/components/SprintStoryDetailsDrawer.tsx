import { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, Circle, Clock3, Flag, History, MessageSquare, Pencil, Send, Trash2, UserRound, X } from "lucide-react";
import { createTaskComment, deleteTaskComment, getTaskComments, getTaskHistory, updateTaskComment } from "../../../api/tasks";
import type { Task } from "../../../entities/task";
import type { TaskComment, TaskHistoryEntry } from "../../../entities/taskActivity";

type Props = { task: Task; onClose: () => void; projectName?: string; addStoryDrawerOpen?: boolean; onUpdate: (changes: Partial<Task>) => void };

const statusLabels: Record<string, string> = {
  backlog: "Backlog", todo: "To Do", in_progress: "In Progress", review: "Review", waiting: "Waiting", done: "Done",
};

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="border-b border-slate-100 py-3"><dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-sm text-slate-700">{children}</dd></div>;
}

function EditableText({ value, onSave, placeholder, multiline = false, type = "text" }: { value: string; onSave: (value: string) => void; placeholder?: string; multiline?: boolean; type?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  function commit() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  if (!editing) return <button type="button" onClick={() => setEditing(true)} className="w-full rounded-md py-1 text-left hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300" title="Click to edit">{value || <span className="italic text-slate-400">{placeholder ?? "Click to add"}</span>}</button>;
  const className = "w-full rounded-md border border-indigo-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none ring-2 ring-indigo-100";
  return multiline
    ? <textarea autoFocus rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Escape") { setDraft(value); setEditing(false); } }} placeholder={placeholder} className={className} />
    : <input autoFocus type={type} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } if (event.key === "Escape") { setDraft(value); setEditing(false); } }} placeholder={placeholder} className={className} />;
}

export function SprintStoryDetailsDrawer({ task, onClose, projectName, addStoryDrawerOpen = false, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "history">("details");
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);

  useEffect(() => {
    let active = true;
    setActivityLoading(true);
    setActivityError("");
    void Promise.all([getTaskComments(task.id), getTaskHistory(task.id)]).then(([loadedComments, loadedHistory]) => {
      if (active) { setComments(loadedComments); setHistory(loadedHistory); }
    }).catch((cause: unknown) => {
      if (active) setActivityError(cause instanceof Error ? cause.message : "Unable to load task activity.");
    }).finally(() => { if (active) setActivityLoading(false); });
    return () => { active = false; };
  }, [task.id]);

  async function refreshActivity() {
    const [loadedComments, loadedHistory] = await Promise.all([getTaskComments(task.id), getTaskHistory(task.id)]);
    setComments(loadedComments);
    setHistory(loadedHistory);
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newComment.trim()) return;
    setSavingActivity(true);
    setActivityError("");
    try {
      await createTaskComment(task.id, newComment.trim());
      setNewComment("");
      await refreshActivity();
    } catch (cause) {
      setActivityError(cause instanceof Error ? cause.message : "Unable to add comment.");
    } finally { setSavingActivity(false); }
  }

  async function saveComment(comment: TaskComment) {
    setSavingActivity(true);
    setActivityError("");
    try {
      await updateTaskComment(task.id, comment.id, editingCommentText.trim());
      setEditingCommentId(null);
      setEditingCommentText("");
      await refreshActivity();
    } catch (cause) {
      setActivityError(cause instanceof Error ? cause.message : "Unable to update comment.");
    } finally { setSavingActivity(false); }
  }

  async function removeComment(comment: TaskComment) {
    if (!window.confirm("Delete this comment?")) return;
    setSavingActivity(true);
    setActivityError("");
    try { await deleteTaskComment(task.id, comment.id); await refreshActivity(); }
    catch (cause) { setActivityError(cause instanceof Error ? cause.message : "Unable to delete comment."); }
    finally { setSavingActivity(false); }
  }

  const readyChecks = [
    { label: "Description added", ready: Boolean(task.description.trim()) },
    { label: "Estimate added", ready: Boolean(task.estimate) },
    { label: "Owner assigned", ready: Boolean(task.assignee) },
    { label: "Ready for sprint", ready: task.ready_for_sprint },
  ];

  return <aside data-testid="sprint-story-details" aria-label={`Details for ${task.title}`} className={`fixed inset-y-0 z-[60] flex w-full flex-col border-r border-slate-200 bg-white shadow-2xl sm:left-auto ${addStoryDrawerOpen ? "right-0 sm:right-[400px] sm:w-[min(840px,calc(100vw-400px))]" : "right-0 sm:w-[min(840px,100vw)]"}`}>
    <header className="border-b border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1"><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-indigo-600">NEX-{task.id} · {task.work_type.replace("_", " ")}</p><div className="mt-1"><EditableText value={task.title} onSave={(title) => onUpdate({ title })} placeholder="Add a title" /></div></div>
        <button type="button" aria-label="Close story details" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700" title="Click to edit status"><span className="sr-only">Status</span><select aria-label="Edit task status" value={task.status} onChange={(event) => onUpdate({ status: event.target.value })} className="cursor-pointer appearance-none bg-transparent outline-none">{Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></label>
        <label className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${task.priority === "urgent" || task.priority === "high" ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"}`} title="Click to edit priority"><span className="sr-only">Priority</span><select aria-label="Edit task priority" value={task.priority} onChange={(event) => onUpdate({ priority: event.target.value as Task["priority"] })} className="cursor-pointer appearance-none bg-transparent outline-none">{["urgent", "high", "medium", "low"].map((priority) => <option key={priority} value={priority}>{priority} priority</option>)}</select></label>
        {task.blocked && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800"><AlertTriangle size={12} />Blocked</span>}
      </div>
    </header>
    <nav aria-label="Task details sections" className="flex shrink-0 gap-1 border-b border-slate-200 px-5 pt-2">{(["details", "comments", "history"] as const).map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? "page" : undefined} className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold capitalize ${activeTab === tab ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{tab === "comments" ? <MessageSquare size={14} /> : tab === "history" ? <History size={14} /> : null}{tab}{tab === "comments" && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">{comments.length}</span>}</button>)}</nav>
    {activityError && <p role="alert" className="mx-5 mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{activityError}</p>}
    {activeTab === "details" && <div className="flex-1 overflow-y-auto px-5 py-2">
      <dl>
        <Detail label="Description"><EditableText value={task.description} onSave={(description) => onUpdate({ description })} placeholder="Add a description" multiline /></Detail>
        <Detail label="Project">{projectName ?? task.project_name ?? `Project ${task.project}`}</Detail>
        <Detail label="Sprint">{task.sprint_name || "Not in a sprint"}</Detail>
        <Detail label="Assigned to"><span className="inline-flex items-center gap-2">{task.assignee_photo_url ? <img src={task.assignee_photo_url} alt="" className="size-7 rounded-full object-cover" /> : <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500"><UserRound size={15} /></span>}{task.assignee_name || "Unassigned"}</span></Detail>
        <Detail label="Estimate"><span className="inline-flex w-full items-center gap-1.5"><Clock3 size={14} className="shrink-0 text-slate-400" /><EditableText value={task.estimate} onSave={(estimate) => onUpdate({ estimate })} placeholder="Add story points" /></span></Detail>
        <Detail label="Due date"><span className="inline-flex w-full items-center gap-1.5"><CalendarDays size={14} className="shrink-0 text-slate-400" /><EditableText type="date" value={task.due_date ?? ""} onSave={(due_date) => onUpdate({ due_date: due_date || null })} placeholder="Add due date" /></span></Detail>
        <Detail label="Tags"><EditableText value={task.tags.join(", ")} onSave={(tags) => onUpdate({ tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) })} placeholder="Add tags, separated by commas" /></Detail>
        <Detail label="Definition of ready"><ul className="space-y-2">{readyChecks.map((check) => <li key={check.label} className="flex items-center gap-2">{check.ready ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Circle size={15} className="text-slate-300" />}{check.label}</li>)}</ul></Detail>
        {task.blocked_by.length > 0 && <Detail label="Dependencies"><span className="inline-flex items-center gap-1.5"><Flag size={14} className="text-amber-600" />{task.blocked_by.map((id) => `NEX-${id}`).join(", ")}</span></Detail>}
      </dl>
    </div>}
    {activeTab === "comments" && <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">{activityLoading && <p className="text-sm text-slate-500">Loading comments…</p>}{!activityLoading && comments.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center"><MessageSquare className="mx-auto text-slate-300" size={24} /><p className="mt-2 text-sm font-semibold text-slate-700">No comments yet</p><p className="mt-1 text-xs text-slate-500">Start the conversation about this work item.</p></div>}
        {comments.map((comment) => <article key={comment.id} className="rounded-xl border border-slate-200 bg-white p-4"><header className="flex items-start gap-3">{comment.author_photo_url ? <img src={comment.author_photo_url} alt="" className="size-8 rounded-full object-cover" /> : <span className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{comment.author_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold text-slate-800">{comment.author_name}</p><time className="text-[10px] text-slate-400">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(comment.created_at))}{comment.updated_at !== comment.created_at && " · edited"}</time></div>{(comment.can_edit || comment.can_delete) && <div className="flex items-center gap-1">{comment.can_edit && <button type="button" aria-label="Edit comment" title="Edit comment" onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }} className="rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700"><Pencil size={14} /></button>}{comment.can_delete && <button type="button" aria-label="Delete comment" title="Delete comment" onClick={() => void removeComment(comment)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={14} /></button>}</div>}</div>
          {editingCommentId === comment.id ? <div className="mt-3 space-y-2"><textarea autoFocus value={editingCommentText} onChange={(event) => setEditingCommentText(event.target.value)} rows={3} maxLength={10000} className="w-full rounded-lg border border-indigo-300 p-2.5 text-sm outline-none ring-2 ring-indigo-100" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingCommentId(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" disabled={savingActivity || !editingCommentText.trim()} onClick={() => void saveComment(comment)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Save edit</button></div></div> : <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>}</div></header></article>)}
      </div>
      <form onSubmit={(event) => void submitComment(event)} className="border-t border-slate-200 bg-slate-50 p-4"><label htmlFor="task-comment-input" className="mb-2 block text-xs font-semibold text-slate-700">Add a comment</label><div className="flex items-end gap-2"><textarea id="task-comment-input" value={newComment} onChange={(event) => setNewComment(event.target.value)} rows={3} maxLength={10000} placeholder="Share an update or ask a question…" className="min-h-20 flex-1 resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /><button type="submit" aria-label="Post comment" disabled={savingActivity || !newComment.trim()} className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"><Send size={16} /></button></div></form>
    </div>}
    {activeTab === "history" && <div className="flex-1 overflow-y-auto p-5"><p className="mb-4 text-xs text-slate-500">Read-only task activity trail.</p>{activityLoading && <p className="text-sm text-slate-500">Loading history…</p>}{!activityLoading && history.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">No history recorded for this task yet.</p>}<ol className="relative ml-2 space-y-5 border-l border-slate-200 pl-5">{history.map((entry) => <li key={entry.id} className="relative"><span className="absolute -left-[26px] top-1 grid size-3 place-items-center rounded-full border-2 border-indigo-400 bg-white" /><p className="text-xs font-semibold capitalize text-slate-800">{entry.action.replaceAll("_", " ")} <span className="font-normal text-slate-500">by {entry.actor_name}</span></p><time className="text-[10px] text-slate-400">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.created_at))}</time>{Object.entries(entry.changes).length > 0 && <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{Object.entries(entry.changes).map(([field, change]) => <li key={field}><span className="font-medium capitalize">{field.replaceAll("_", " ")}</span>: {change.old === undefined ? "Added" : `${formatHistoryValue(change.old)} → `}{change.new !== undefined && formatHistoryValue(change.new)}</li>)}</ul>}</li>)}</ol></div>}
  </aside>;
}

function formatHistoryValue(value: unknown): string {
  if (value === null) return "None";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
