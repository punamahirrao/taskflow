import { Check, ChevronDown, Layers, Search } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjectContext } from "../context/useProjectContext";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function ProjectSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projects, loading, error, selectedId, select } = useProjectContext();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.description}`.toLowerCase().includes(search),
  );
  const ref = useRef<HTMLDivElement>(null);
  const label =
    projects.find((project) => project.id === selectedId)?.name ??
    t("projectSwitcher.selectProject");
  return (
    <div
      ref={ref}
      className="project-switcher"
      onBlur={(event) => {
        if (!ref.current?.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("projectSwitcher.projectAria", { label })}
        title={collapsed ? label : undefined}
        onClick={() => setOpen(!open)}
        className="project-switcher-trigger"
      >
        <span className="project-mark">
          <Layers size={17} />
        </span>
        {!collapsed && (
          <>
            <span className="truncate">{label}</span>
            <ChevronDown size={14} className="ml-auto shrink-0" />
          </>
        )}
      </button>
      {open && (
        <>
          <button
            className="popover-dismiss"
            aria-label="Close project picker"
            onClick={() => setOpen(false)}
            tabIndex={-1}
          />
          <div
            role="dialog"
            aria-label="Select project"
            className={`project-picker ${collapsed ? "from-rail" : ""}`}
          >
            <label className="shell-search">
              <Search size={16} />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your projects…"
                aria-label="Search your projects"
              />
            </label>
            <p className="picker-caption">YOUR PROJECTS</p>
            <div className="picker-results">
              {loading && (
                <p role="status" className="picker-message">
                  Loading projects…
                </p>
              )}
              {error && (
                <p role="alert" className="picker-message">
                  {error}
                </p>
              )}
              {!loading && !error && !filteredProjects.length && (
                <p className="picker-message">No projects found.</p>
              )}
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="project-option"
                  onClick={() => {
                    select(project.id);
                    setOpen(false);
                    navigate(`/project/${project.id}`);
                  }}
                >
                  <Layers size={16} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{project.name}</span>
                    <small>Open project</small>
                  </span>
                  {project.id === selectedId && <Check size={15} />}
                </button>
              ))}
            </div>
            <Link to="/projects" onClick={() => setOpen(false)} className="picker-footer">
              Browse project directory →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
