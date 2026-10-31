import { useState } from "react";
import { X } from "lucide-react";
import { updateProject } from "../../../api/projects";
import type { Project } from "../../../entities/project";
import { useDialogBehavior } from "../../../shared/hooks/useDialogBehavior";

type Props = { project: Project; onClose: () => void; onUpdated: (project: Project) => void };

export function EditProjectDialog({ project, onClose, onUpdated }: Props) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [startDate, setStartDate] = useState(project.expected_start_date ?? "");
  const [endDate, setEndDate] = useState(project.end_date ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useDialogBehavior(onClose, saving);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (endDate && startDate && endDate < startDate) {
      setError("End date must be on or after the expected start date.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProject(project.id, {
        name: name.trim(),
        description: description.trim(),
        expected_start_date: startDate || null,
        end_date: endDate || null,
      });
      onUpdated(updated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the project.");
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100";

  return <div onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="edit-project-title" className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 id="edit-project-title" className="text-lg font-semibold text-gray-900">Edit project details</h2>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Close dialog" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={20} aria-hidden="true" /></button>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <label className="block text-sm font-medium text-gray-700">Project name
          <input required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} disabled={saving} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm font-medium text-gray-700">Description
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} disabled={saving} className={`${inputClass} mt-1 resize-y`} />
        </label>
        <label className="block text-sm font-medium text-gray-700">Expected start date
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} disabled={saving} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm font-medium text-gray-700">End date
          <input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} disabled={saving} className={`${inputClass} mt-1`} />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <footer className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
        </footer>
      </form>
    </section>
  </div>;
}
