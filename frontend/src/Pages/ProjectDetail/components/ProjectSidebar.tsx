import { useState, type FormEvent } from "react";

type Project = {
  id: number;
  name: string;
  description: string;
  owner: number;
};

type ProjectSidebarProps = {
  projects: Project[];
  activeProjectId: number;
  onSelectProject: (projectId: number) => void;
  onCreateProject: (name: string, description: string) => Promise<void>;
};

function ProjectSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
}: ProjectSidebarProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onCreateProject(name.trim(), description.trim());
      setName("");
      setDescription(""); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="border-r border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Projects</h2>

      <nav aria-label="Projects" className="mb-6 space-y-1">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelectProject(project.id)}
            aria-current={project.id === activeProjectId ? "page" : undefined}
            className={
              project.id === activeProjectId
                ? "w-full rounded bg-cyan-100 p-2 text-left font-medium text-cyan-900"
                : "w-full rounded p-2 text-left text-gray-700 hover:bg-gray-100"
            }
          >
            {project.name}
          </button>
        ))}
      </nav>

      <form onSubmit={handleCreateProject} className="space-y-3 border-t border-gray-200 pt-5">
        <h3 className="font-semibold text-gray-900">Create project</h3>
        <label className="block text-sm font-medium text-gray-700">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
            placeholder="Project name"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
            placeholder="Project description"
            rows={3}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-cyan-600 px-3 py-2 text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create project"}
        </button>
      </form>
    </aside>
  );
}

export default ProjectSidebar;