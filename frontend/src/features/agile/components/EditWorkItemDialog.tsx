import { useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import type { Project } from "../../../entities/project";
import type { Task, TaskPriority, TaskStatus, WorkType } from "../../../entities/task";

const TYPES: WorkType[] = ["initiative", "epic", "task", "idea", "enhancement", "bug", "spike", "research"];
const STATUSES: { key: TaskStatus; name: string }[] = [
  { key: "backlog", name: "Backlog" }, { key: "todo", name: "To Do" },
  { key: "in_progress", name: "In Progress" }, { key: "review", name: "Review" }, { key: "done", name: "Done" },
];

export function EditWorkItemDialog({ task, project, candidates, onClose, onSave }: {
  task: Task; project: Project; candidates: Task[]; onClose: () => void;
  onSave: (changes: Partial<Task>) => Promise<unknown>;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [workType, setWorkType] = useState(task.work_type);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [estimate, setEstimate] = useState(task.estimate ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [tags, setTags] = useState(task.tags.join(", "));
  const [assignee, setAssignee] = useState(task.assignee ? String(task.assignee) : "");
  const [parent, setParent] = useState(task.parent ? String(task.parent) : "");
  const [blockedBy, setBlockedBy] = useState(task.blocked_by ?? []);
  const [blocked, setBlocked] = useState(task.blocked);
  const [escalated, setEscalated] = useState(task.escalated);
  const [doneChecks, setDoneChecks] = useState(task.definition_done ?? []);
  const [ready, setReady] = useState(task.ready_for_sprint);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const parents = candidates.filter((item) => item.project === task.project && item.id !== task.id && ["epic", "initiative"].includes(item.work_type));
  const dependencies = candidates.filter((item) => item.id !== task.id);
  const childWork = candidates.filter((item) => item.parent === task.id);
  const completedChildWork = childWork.filter((item) => item.status === "done").length;
  const statusOptions = statusOptionsFor(status);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) { setError("A title is required."); return; }
    setSaving(true); setError("");
    try {
      const saved = await onSave({
        title: title.trim(), description: description.trim(), work_type: workType,
        priority: priority as TaskPriority, status, estimate: estimate.trim(),
        due_date: dueDate || null, tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
        assignee: assignee ? Number(assignee) : null, parent: parent ? Number(parent) : null,
        blocked_by: blockedBy, blocked, escalated, definition_done: doneChecks, ready_for_sprint: ready,
      });
      if (!saved) { setError("Unable to save this work item. Check your access and try again."); return; }
      onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save this work item."); }
    finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="edit-work-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <header className="mb-5 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-600">{project.name}</p><h2 id="edit-work-title" className="mt-1 text-xl font-semibold text-slate-900">Edit work item</h2></div><button type="button" onClick={onClose} aria-label="Close editor" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></header>
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">Title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-200" /></label>
        <label className="block text-sm font-medium text-slate-700">Description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-200" /></label>
        {(task.work_type === "epic" || task.work_type === "initiative") && <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-violet-900">Child work progress</span><span className="font-bold text-violet-700">{completedChildWork}/{childWork.length} complete</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-violet-500" style={{ width: `${childWork.length ? completedChildWork / childWork.length * 100 : 0}%` }} /></div></div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type"><select value={workType} onChange={(event) => setWorkType(event.target.value as WorkType)} className={inputClass}>{TYPES.map((item) => <option key={item} value={item}>{capitalize(item)}</option>)}</select></Field>
          <Field label="Status"><select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>{statusOptions.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}</select></Field>
          <Field label="Priority"><select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className={inputClass}>{["urgent", "high", "medium", "low"].map((item) => <option key={item} value={item}>{capitalize(item)}</option>)}</select></Field>
          <Field label="Estimate"><input value={estimate} onChange={(event) => setEstimate(event.target.value)} placeholder="Story points or t-shirt size" className={inputClass} /></Field>
          <Field label="Due date"><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={inputClass} /></Field>
          <Field label="Assignee"><select value={assignee} onChange={(event) => setAssignee(event.target.value)} className={inputClass}><option value="">Unassigned</option>{task.assignee && !project.members?.some((member) => member.id === task.assignee) && <option value={task.assignee}>{task.assignee_name} (former project member)</option>}{(project.members ?? []).map((member) => <option key={member.id} value={member.id}>{member.first_name} {member.last_name}</option>)}</select></Field>
          <Field label="Tags"><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Separate tags with commas" className={inputClass} /></Field>
          <Field label="Epic / initiative"><select value={parent} onChange={(event) => setParent(event.target.value)} className={inputClass}><option value="">No parent</option>{parents.map((item) => <option key={item.id} value={item.id}>{item.work_type}: {item.title}</option>)}</select></Field>
        </div>
        <fieldset><legend className="mb-2 text-sm font-medium text-slate-700">Definition of Done</legend><div className="grid gap-1 rounded-lg border border-slate-200 p-2 sm:grid-cols-2">{doneChecks.map((check, index) => <label key={check.key} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50"><input type="checkbox" checked={check.done} onChange={(event) => setDoneChecks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, done: event.target.checked } : item))} />{check.label}</label>)}</div></fieldset>
        <fieldset><legend className="mb-2 text-sm font-medium text-slate-700">Dependencies across accessible projects</legend><div className="grid max-h-32 gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-2">{dependencies.length ? dependencies.map((item) => <label key={item.id} className="flex items-center gap-2 truncate rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"><input type="checkbox" checked={blockedBy.includes(item.id)} onChange={(event) => setBlockedBy((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /><span className="truncate">{item.title}<span className="ml-1 text-[10px] text-slate-400">{item.project_name ?? `Project ${item.project}`}</span></span></label>) : <span className="p-2 text-xs text-slate-400">No other work items in your project scope.</span>}</div></fieldset>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" checked={ready} onChange={(event) => setReady(event.target.checked)} />Ready for sprint</label><label className="flex items-center gap-2"><input type="checkbox" checked={blocked} onChange={(event) => setBlocked(event.target.checked)} />Blocked</label><label className="flex items-center gap-2"><input type="checkbox" checked={escalated} onChange={(event) => setEscalated(event.target.checked)} />Escalate blocker</label></div>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" disabled={saving} onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button><button disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></footer>
      </form>
    </section>
  </div>;
}

const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-200";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}</label>;
}

function capitalize(value: string) { return value[0].toUpperCase() + value.slice(1); }
function statusOptionsFor(status: TaskStatus) {
  return STATUSES.some((item) => item.key === status) ? STATUSES : [...STATUSES, { key: status, name: status.replaceAll("_", " ") }];
}
