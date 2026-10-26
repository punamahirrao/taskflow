import { useState } from "react";
import { X } from "lucide-react";
import { createProject } from "../../../api/projects";
import type { Project } from "../../../entities/project";
import { useDialogBehavior } from "../../../shared/hooks/useDialogBehavior";

type CreateProjectProps = {
  onClose: () => void;
  onCreated: (project: Project) => Promise<void> | void;
};

function CreateProject({ onClose, onCreated }: CreateProjectProps) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
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
      setError("Project name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newProject = await createProject({ name: projectName, description: projectDescription });
      setProjectName("");
      setProjectDescription("");
      await onCreated(newProject);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project.");
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
            Create new project
          </h2>

          <button
            type="button"
            onClick={requestClose}
            disabled={submitting}
            aria-label="Close dialog"
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
                Project name
              </label>
              <input
                id="project-name"
                type="text"
                autoFocus
                placeholder="Enter project name"
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
                Description
              </label>
              <input
                id="project-description"
                type="text"
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;
