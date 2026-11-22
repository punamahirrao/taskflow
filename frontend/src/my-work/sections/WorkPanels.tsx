import { useState } from "react";
import { ArrowUpRight, AtSign, Download, FileText, FolderKanban, History } from "lucide-react";
import { Link } from "react-router-dom";
import { useActivityQuery } from "../../dashboard/api/dashboardQueries";
import { useDocumentsQuery } from "../../documents/api/documentsQuery";
import { type DataScope } from "../../common/api/queryApi";
import type { Project } from "../../common/entities/project";
import type { Task } from "../../features/tasks/entities/task";
import { downloadDocument } from "../../documents/api/documents";

export function WorkProjects({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const mine = projects.map((project) => {
    const assigned = tasks.filter((task) => task.project === project.id);
    const completed = assigned.filter((task) => task.status === "done").length;
    return { project, completed, open: assigned.length - completed };
  });
  return (
    <section className="my-work-panel">
      <header className="my-work-panel-heading">
        <h2>My Projects</h2>
      </header>
      <ul className="my-work-list">
        {mine.map(({ project, open, completed }) => (
          <li key={project.id}>
            <FolderKanban size={20} className="my-work-list-icon" />
            <Link className="my-work-item-link" to={`/project/${project.id}`}>
              {project.name}
              <small>Your role: {project.my_role ?? "Member"}</small>
            </Link>
            <span className="my-work-muted">
              {open} open · {completed} completed
            </span>
          </li>
        ))}
        {!mine.length && (
          <li className="my-work-muted">Your projects will appear here when you join one.</li>
        )}
      </ul>
    </section>
  );
}

export function WorkDocuments({ scope }: { scope: DataScope }) {
  const { currentData, error, isFetching } = useDocumentsQuery({
    ...scope,
    location: "personal",
    folderId: null,
  });
  const [downloadError, setDownloadError] = useState("");

  async function download(id: number, filename: string) {
    setDownloadError("");
    try {
      const url = URL.createObjectURL(await downloadDocument(id));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setDownloadError(cause instanceof Error ? cause.message : "Could not download this file.");
    }
  }

  return (
    <section className="my-work-panel">
      <header className="my-work-panel-heading">
        <h2>My Documents</h2>
        <Link className="my-work-link" to="/documents?location=personal">
          Manage private files <ArrowUpRight size={15} />
        </Link>
      </header>
      {error || downloadError ? (
        <p className="my-work-empty" role="alert">
          {downloadError || "Your private files could not be loaded."}
        </p>
      ) : null}
      {isFetching && !currentData && (
        <p className="my-work-empty" role="status">
          Loading your files…
        </p>
      )}
      {currentData && (
        <ul className="my-work-list">
          {currentData.folders.map((folder) => (
            <li key={`folder-${folder.id}`}>
              <FolderKanban size={18} className="my-work-list-icon" />
              <Link className="my-work-item-link" to="/documents?location=personal">
                {folder.name}
                <small>Private folder</small>
              </Link>
            </li>
          ))}
          {currentData.documents.map((file) => (
            <li key={file.id}>
              <FileText size={18} className="my-work-list-icon" />
              <span className="my-work-list-label">
                <b>{file.name}</b>
                <small>{Math.ceil(file.size / 1024)} KB</small>
              </span>
              <button
                type="button"
                className="my-work-icon-button"
                aria-label={`Download ${file.name}`}
                onClick={() => void download(file.id, file.name)}
              >
                <Download size={17} />
              </button>
            </li>
          ))}
          {currentData.links.map((link) => (
            <li key={`link-${link.id}`}>
              <ArrowUpRight size={18} className="my-work-list-icon" />
              <a className="my-work-item-link" href={link.url} target="_blank" rel="noreferrer">
                {link.name}
                <small>Private resource link</small>
              </a>
            </li>
          ))}
          {!currentData.folders.length &&
            !currentData.documents.length &&
            !currentData.links.length && (
              <li className="my-work-muted">
                Open your private library to add a document, folder, or link.
              </li>
            )}
        </ul>
      )}
    </section>
  );
}

export function WorkActivity({
  scope,
  tasks,
  full,
  onView,
  onTask,
}: {
  scope: DataScope;
  tasks: Task[];
  full?: boolean;
  onView: () => void;
  onTask: (task: Task) => void;
}) {
  const { currentData, isFetching, error } = useActivityQuery({ ...scope, mine: true });
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const items = currentData?.filter((item) => byId.has(item.task_id)) ?? [];
  return (
    <section className="my-work-panel">
      <header className="my-work-panel-heading">
        <h2>Updates on my tasks</h2>
        {!full && (
          <button type="button" className="my-work-link" onClick={onView}>
            View updates →
          </button>
        )}
      </header>
      {error ? (
        <p className="my-work-empty" role="alert">
          Task updates could not be loaded.
        </p>
      ) : isFetching && !currentData ? (
        <p className="my-work-empty" role="status">
          Loading task updates…
        </p>
      ) : items.length ? (
        <ul className="my-work-list">
          {items.slice(0, full ? items.length : 4).map((item) => (
            <li key={item.id}>
              <span className="my-work-avatar" aria-hidden="true">
                {item.actor
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <button
                type="button"
                className="my-work-item-link"
                onClick={() => {
                  const task = byId.get(item.task_id);
                  if (task) onTask(task);
                }}
              >
                {item.title}
                <small>
                  {item.actor} · {item.action.replaceAll("_", " ")}
                </small>
              </button>
              <time dateTime={item.created_at}>
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <div className="my-work-agenda-empty">
          <History size={20} />
          <p>Changes to your assigned tasks will appear here.</p>
        </div>
      )}
    </section>
  );
}

export function WorkMentionsPreview() {
  return (
    <section className="my-work-panel">
      <header className="my-work-panel-heading">
        <h2>Mentions</h2>
      </header>
      <ul className="my-work-list">
        <li>
          <span className="my-work-avatar preview">
            <AtSign size={18} />
          </span>
          <div className="my-work-list-label">
            <b>A teammate mentioned you</b>
            <small>Example of a tagged comment on your task</small>
          </div>
          <span className="my-work-demo">Demo</span>
        </li>
      </ul>
      <footer className="my-work-panel-footer">
        <span>Mention notifications are planned.</span>
      </footer>
    </section>
  );
}
