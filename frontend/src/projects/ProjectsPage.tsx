import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import type { Project } from "../common/entities/project";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { useToast } from "../common/features/notifications/useToast";
import { useProjectDirectory } from "../common/features/projects/useProjectDirectory";
import { useAppSelector } from "../common/store";
import CreateProjectDialog from "./features/CreateProjectDialog";
import { ProjectListSection } from "./sections/ProjectListSection";
import { OrganizationProjectCard } from "./features/OrganizationProjectCard";
import { RequestAccessDialog } from "./features/RequestAccessDialog";
import { AccessRequestInbox } from "./features/AccessRequestInbox";
import { ProjectDirectoryStyles } from "./Projects.styles";
import type { ProjectDirectoryEntry } from "./api/projects";

const PAGE_SIZE = 6;

export default function ProjectsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.session.user?.id);
  const { projects, loading, error, reload, select, setDefault } = useProjectContext();
  const [actionError, setActionError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const directory = useProjectDirectory(search);
  const [showCreate, setShowCreate] = useState(false);
  const [requesting, setRequesting] = useState<ProjectDirectoryEntry | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedLimit, setAssignedLimit] = useState(PAGE_SIZE);
  const [otherLimit, setOtherLimit] = useState(PAGE_SIZE);
  const assigned = projects.filter((project) =>
    project.members?.some((member) => member.id === userId),
  );
  const assignedIds = new Set(assigned.map((project) => project.id));
  const filtered = assigned.filter(
    (project) =>
      (statusFilter === "all" || project.status === statusFilter) &&
      `${project.name} ${project.description}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const others = directory.projects.filter(
    (project) =>
      !assignedIds.has(project.id) && (statusFilter === "all" || project.status === statusFilter),
  );

  function open(id: number) {
    select(id);
    navigate(`/project/${id}`);
  }
  async function refreshProjects() {
    await reload();
    directory.reload();
  }
  async function toggleDefault(project: Project) {
    setActionError("");
    try {
      await setDefault(project.is_default ? null : project.id);
      toast("success", t("projects.defaultUpdatedToast"));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("projects.unableToUpdateDefault");
      setActionError(message);
      toast("error", message);
    }
  }

  return (
    <main className="project-directory" data-testid="page-projects">
      <ProjectDirectoryStyles />
      <header className="project-directory-header">
        <h1>Projects</h1>
        <div className="project-directory-tools">
          <select
            aria-label={t("projects.filterStatus")}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setAssignedLimit(PAGE_SIZE);
              setOtherLimit(PAGE_SIZE);
            }}
          >
            <option value="all">{t("projects.allStatuses")}</option>
            <option value="in_progress">{t("projects.statusInProgress")}</option>
            <option value="upcoming">{t("projects.statusUpcoming")}</option>
            <option value="archived">{t("projects.statusArchived")}</option>
          </select>
          <button
            type="button"
            className="project-create-button"
            onClick={() => setShowCreate(true)}
            disabled={loading || Boolean(error)}
          >
            {t("projects.create")}
          </button>
        </div>
      </header>
      <label className="shell-search project-directory-search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search project directory"
          placeholder="Search projects…"
          value={search}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value) next.set("q", event.target.value);
            else next.delete("q");
            setSearchParams(next, { replace: true });
            setAssignedLimit(PAGE_SIZE);
            setOtherLimit(PAGE_SIZE);
          }}
        />
      </label>
      <AccessRequestInbox onReviewed={refreshProjects} />
      {loading && (
        <p role="status" className="mb-3 text-sm text-muted">
          {t("projects.loading")}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      )}
      {actionError && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {actionError}
        </p>
      )}
      <section className="project-directory-section" aria-labelledby="assigned-projects-title">
        <div className="project-section-heading">
          <h2 id="assigned-projects-title">
            Assigned to you <span className="project-section-count">{filtered.length}</span>
          </h2>
        </div>
        {!loading &&
          !error &&
          (filtered.length ? (
            <>
              <ProjectListSection
                projects={filtered.slice(0, assignedLimit)}
                onOpen={open}
                onToggleDefault={(project) => void toggleDefault(project)}
              />
              {filtered.length > assignedLimit && (
                <div className="project-more">
                  <button
                    type="button"
                    className="project-text-link"
                    onClick={() => setAssignedLimit(assignedLimit + PAGE_SIZE)}
                  >
                    More assigned projects <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="project-directory-empty">
              {assigned.length ? t("projects.noMatch") : "No projects are assigned to you yet."}
            </p>
          ))}
      </section>
      <section className="project-directory-section" aria-labelledby="organization-projects-title">
        <div className="project-section-heading">
          <h2 id="organization-projects-title">
            Other organization projects{" "}
            <span className="project-section-count">{others.length}</span>
          </h2>
        </div>
        {directory.loading && (
          <p role="status" className="text-sm text-muted">
            Searching projects…
          </p>
        )}
        {directory.error && (
          <p role="alert" className="text-sm text-danger">
            {directory.error}{" "}
            <button type="button" className="project-text-link" onClick={directory.reload}>
              Retry
            </button>
          </p>
        )}
        {!directory.loading &&
          !loading &&
          !directory.error &&
          !error &&
          (others.length ? (
            <>
              <div className="project-directory-grid">
                {others.slice(0, otherLimit).map((project) => (
                  <OrganizationProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => open(project.id)}
                    onRequest={() => setRequesting(project)}
                  />
                ))}
              </div>
              {others.length > otherLimit && (
                <div className="project-more">
                  <button
                    type="button"
                    className="project-text-link"
                    onClick={() => setOtherLimit(otherLimit + PAGE_SIZE)}
                  >
                    More organization projects <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="project-directory-empty">No other projects match your search.</p>
          ))}
      </section>
      {showCreate && (
        <CreateProjectDialog onClose={() => setShowCreate(false)} onCreated={refreshProjects} />
      )}
      {requesting && (
        <RequestAccessDialog
          project={requesting}
          onClose={() => setRequesting(null)}
          onSent={() => {
            setRequesting(null);
            directory.reload();
            toast("success", "Access request sent to the project owner and admins.");
          }}
        />
      )}
    </main>
  );
}
