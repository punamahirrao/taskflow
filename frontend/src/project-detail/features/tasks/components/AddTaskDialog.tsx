import { useState } from "react";
import { apiFetch } from "../../../../common/api/client";
import { X } from "lucide-react";
import type { Task } from "../../../../common/entities/task";
import type { Project } from "../../../../common/entities/project";
import { useTranslation } from "../../../../common/shared/i18n/hooks/useTranslation";

interface AddTaskProps {
  project: Pick<Project, "id">;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
}

function AddTask({
  project,
  onClose,
  onTaskAdded,
}: AddTaskProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddTask = async (event: React.FormEvent) => {
    event.preventDefault();
     if (!project || !title.trim()) {
          setError(t("projectDetail.addTask.titleRequired"));
          return;
        }
    
        setSubmitting(true);
        setError("");
        try {
          const task = await apiFetch<Task>("/tasks/", {
            method: "POST",
            body: JSON.stringify({
              project_id: project.id,
              title: title.trim(),
              description: description.trim(),
              status,
            }),
          });
          onTaskAdded(task);
          setTitle("");
          setDescription("");
          setStatus("todo");
        } catch (err) {
          setError(err instanceof Error ? err.message : t("projectDetail.addTask.unableToAdd"));
        } finally {
          setSubmitting(false);
        }
    };

 return (
    <>
      {error && (
        <div className="mb-4 text-red-500">
          {error}
        </div>
      )}

    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
      className="bg-white rounded-xl shadow-xl border border-gray-200 p-6"
      >
            <div className="flex items-center justify-between mb-4">
              <h2 id="add-task-title" className="text-xl font-semibold text-gray-900">
              {t("projectDetail.addTask.heading")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
              <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAddTask}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("projectDetail.addTask.title")}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t("projectDetail.addTask.titlePlaceholder")}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("projectDetail.addTask.description")}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("projectDetail.addTask.descriptionPlaceholder")}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("projectDetail.addTask.status")}
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Task["status"])}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="todo">{t("projectDetail.addTask.statusTodo")}</option>
                  <option value="in_progress">{t("projectDetail.addTask.statusInProgress")}</option>
                  <option value="done">{t("projectDetail.addTask.statusDone")}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-500 text-white px-4 py-2.5 rounded-lg hover:bg-cyan-600 disabled:opacity-50"
              >
                {submitting ? t("projectDetail.addTask.adding") : t("projectDetail.addTask.submit")}
              </button>
            </form>
        </div>
    </>
  );
}

export default AddTask; 
