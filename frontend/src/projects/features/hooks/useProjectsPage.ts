import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Project } from "../../../common/entities/project";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { useToast } from "../../../common/features/notifications/useToast";
import { useProjectDirectory } from "../../../common/features/projects/useProjectDirectory";
import { useAppSelector } from "../../../common/store";
import type { ProjectDirectoryEntry } from "../../api/projects";

const PAGE_SIZE = 6;

export function useProjectsPage() {
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

  function changeStatus(value: string) {
    setStatusFilter(value);
    setAssignedLimit(PAGE_SIZE);
    setOtherLimit(PAGE_SIZE);
  }
  function changeSearch(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
    setAssignedLimit(PAGE_SIZE);
    setOtherLimit(PAGE_SIZE);
  }
  function requestSent() {
    setRequesting(null);
    directory.reload();
    toast("success", "Access request sent to the project owner and admins.");
  }
  return {
    toolbarProps: {
      search,
      statusFilter,
      createDisabled: loading || Boolean(error),
      onSearch: changeSearch,
      onStatusChange: changeStatus,
      onCreate: () => setShowCreate(true),
    },
    assignedProps: {
      projects: filtered,
      hasAssignedProjects: assigned.length > 0,
      loading,
      error,
      limit: assignedLimit,
      onMore: () => setAssignedLimit(assignedLimit + PAGE_SIZE),
      onOpen: open,
      onToggleDefault: toggleDefault,
    },
    organizationProps: {
      projects: others,
      loading: directory.loading,
      error: directory.error,
      assignedLoading: loading,
      assignedError: error,
      limit: otherLimit,
      onMore: () => setOtherLimit(otherLimit + PAGE_SIZE),
      onRetry: directory.reload,
      onOpen: open,
      onRequest: setRequesting,
    },
    loading,
    error,
    actionError,
    refreshProjects,
    createProps: showCreate
      ? { onClose: () => setShowCreate(false), onCreated: refreshProjects }
      : null,
    requestProps: requesting
      ? { project: requesting, onClose: () => setRequesting(null), onSent: requestSent }
      : null,
  };
}
