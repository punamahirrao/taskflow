import { useState } from "react";
import { X } from "lucide-react";
import { createProject } from "../../../common/api/projects";
import type { Project } from "../../../common/entities/project";
import { useDialogBehavior } from "../../../common/shared/hooks/useDialogBehavior";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

interface CreateProjectProps {
  onClose: () => void;
  onCreated: (project: Project) => Promise<void> | void;
}

function CreateProject({ onClose, onCreated }: CreateProjectProps) {
  const { t } = useTranslation();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [expectedStartDate, setExpectedStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useDialogBehavior(onClose, submitting);

  const requestClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!projectName.trim()) {
      setError(t("projects.dialog.nameRequired"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (expectedStartDate && endDate && endDate < expectedStartDate) {
        setError(t("projects.dialog.endBeforeStart"));
        return;
      }
      const newProject = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
        expected_start_date: expectedStartDate || null,
        end_date: endDate || null,
      });
      setProjectName("");
      setProjectDescription("");
      await onCreated(newProject);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("projects.dialog.unableToCreate"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2
            id="create-project-title"
            className="text-xl font-semibold text-gray-900"
          >
            {t("projects.dialog.title")}
          </h2>

          <button
            type="button"
            onClick={requestClose}
            disabled={submitting}
            aria-label={t("projects.dialog.closeDialog")}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateProject} className="px-6 py-5">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="project-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("projects.dialog.projectName")}
              </label>
              <input
                id="project-name"
                type="text"
                autoFocus
                placeholder={t("projects.dialog.projectNamePlaceholder")}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("projects.dialog.description")}
              </label>
              <input
                id="project-description"
                type="text"
                placeholder={t("projects.dialog.descriptionPlaceholder")}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="project-due-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("projects.dialog.expectedStartDate")}
              </label>
              <input
                id="project-start-date"
                type="date"
                value={expectedStartDate}
                onChange={(e) => setExpectedStartDate(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label htmlFor="project-end-date" className="mb-1 block text-sm font-medium text-gray-700">
                {t("projects.dialog.endDate")}
              </label>
              <input
                id="project-end-date"
                type="date"
                min={expectedStartDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={requestClose}
              disabled={submitting}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              {t("projects.dialog.cancel")}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 disabled:opacity-50"
            >
              {submitting ? t("projects.dialog.creating") : t("projects.dialog.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;
