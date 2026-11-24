import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getAccessibleAgileBoards,
  getAgileBoards,
  getAgileBoardColumns,
  getBoardColumns,
} from "../../../features/tasks/api/boards";
import { getSprints } from "../../../features/tasks/api/sprints";
import type { AgileBoard, BoardColumn, Sprint, Task } from "../../../features/tasks/entities/task";
import { useAgileProjectScope } from "../../../common/features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../../../features/tasks/hooks/useAgileTasks";
import type { Swimlane } from "../../../common/features/agile/utils/boardView";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardColumnGroup } from "../../entities/boards";

export function useBoardWorkspace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();
  const [resolvedBoard, setResolvedBoard] = useState<AgileBoard | null>(null);
  const boardProjectId =
    resolvedBoard?.id === Number(boardId)
      ? resolvedBoard.project
      : Number(searchParams.get("project")) || null;
  useEffect(() => {
    let active = true;
    void getAccessibleAgileBoards()
      .then((boards) => {
        if (active) setResolvedBoard(boards.find((board) => board.id === Number(boardId)) ?? null);
      })
      .catch(() => {
        if (active) setResolvedBoard(null);
      });
    return () => {
      active = false;
    };
  }, [boardId]);
  const scope = useAgileProjectScope();
  const [sprintMode, setSprintMode] = useState(true);
  const [swimlane, setSwimlane] = useState<Swimlane>("project");
  const agile = useAgileTasks(boardProjectId, false, Number(boardId) || null);
  const [columnsByProject, setColumnsByProject] = useState<Record<number, BoardColumn[]>>({});
  const [message, setMessage] = useState("");
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [detailsTaskId, setDetailsTaskId] = useState<number | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const drawerCloseTimer = useRef<number | null>(null);
  const [boardsByProject, setBoardsByProject] = useState<Record<number, AgileBoard[]>>({});
  const [configureWorkflow, setConfigureWorkflow] = useState(false);

  const visibleProjects = useMemo(
    () => (boardProjectId ? scope.projects.filter((project) => project.id === boardProjectId) : []),
    [boardProjectId, scope.projects],
  );
  const visibleProjectKey = visibleProjects.map((project) => project.id).join(",");
  useEffect(() => {
    let active = true;
    Promise.all(
      visibleProjects.map(
        async (project) =>
          [
            project.id,
            Number(boardId)
              ? await getAgileBoardColumns(project.id, Number(boardId))
              : await getBoardColumns(project.id),
          ] as const,
      ),
    )
      .then((entries) => {
        if (active) setColumnsByProject(Object.fromEntries(entries));
      })
      .catch((cause: unknown) => {
        if (active)
          setMessage(cause instanceof Error ? cause.message : t("boards.errLoadWorkflow"));
      });
    return () => {
      active = false;
    };
  }, [visibleProjectKey, visibleProjects, t, boardId]);
  useEffect(() => {
    let active = true;
    Promise.all(
      visibleProjects.map(
        async (project) => [project.id, await getAgileBoards(project.id)] as const,
      ),
    )
      .then((entries) => {
        if (active) setBoardsByProject(Object.fromEntries(entries));
      })
      .catch(() => {
        if (active) setBoardsByProject({});
      });
    return () => {
      active = false;
    };
  }, [visibleProjectKey, visibleProjects]);
  useEffect(() => {
    let active = true;
    void getSprints(boardProjectId, Number(boardId) || null)
      .then((result) => {
        if (active) setSprints(result);
      })
      .catch(() => {
        if (active) setSprints([]);
      });
    const timer = window.setInterval(() => {
      void getSprints(boardProjectId, Number(boardId) || null)
        .then((result) => {
          if (active) setSprints(result);
        })
        .catch(() => undefined);
    }, 20000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [boardProjectId, boardId]);

  const columns = useMemo(() => {
    const found = new Map<string, BoardColumn>();
    Object.values(columnsByProject)
      .flat()
      .forEach((column) => {
        if (!found.has(String(column.id))) found.set(String(column.id), column);
      });
    return [...found.values()].sort(
      (a, b) =>
        a.position - b.position || a.status_order - b.status_order || a.name.localeCompare(b.name),
    );
  }, [columnsByProject]);
  const projectBoards = boardProjectId ? (boardsByProject[boardProjectId] ?? []) : [];
  const selectedBoard = projectBoards.find((board) => board.id === Number(boardId)) ?? null;
  const usesSprints = selectedBoard?.board_type !== "kanban";
  const activeSprints = useMemo(
    () =>
      new Map(
        sprints.filter((sprint) => sprint.is_active).map((sprint) => [sprint.project, sprint]),
      ),
    [sprints],
  );
  const activeSprintsForFilter = useMemo(
    () => new Set(sprints.filter((sprint) => sprint.is_active).map((sprint) => sprint.id)),
    [sprints],
  );
  const boardTasks = agile.tasks.filter(
    (task) =>
      !usesSprints ||
      !sprintMode ||
      task.status === "backlog" ||
      Boolean(task.sprint && activeSprintsForFilter.has(task.sprint)),
  );
  const blockedCount = boardTasks.filter(
    (task) =>
      task.blocked ||
      (task.blocked_by ?? []).some((id) =>
        agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
      ),
  ).length;
  const detailsTask = agile.tasks.find((task) => task.id === detailsTaskId) ?? null;

  useEffect(
    () => () => {
      if (drawerCloseTimer.current !== null) window.clearTimeout(drawerCloseTimer.current);
    },
    [],
  );

  function openStoryDetails(taskId: number) {
    if (drawerCloseTimer.current !== null) window.clearTimeout(drawerCloseTimer.current);
    setDetailsTaskId(taskId);
    setDetailsDrawerOpen(true);
  }

  function closeStoryDetails() {
    setDetailsDrawerOpen(false);
    if (drawerCloseTimer.current !== null) window.clearTimeout(drawerCloseTimer.current);
    drawerCloseTimer.current = window.setTimeout(() => {
      setDetailsTaskId(null);
      drawerCloseTimer.current = null;
    }, 200);
  }

  async function moveToColumn(taskId: number, status: string) {
    const task = agile.tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (status === "backlog") {
      await agile.update(taskId, { status, sprint: null });
      return;
    }
    const sprint = activeSprints.get(task.project);
    await agile.update(taskId, {
      status,
      ...(task.status === "backlog" && sprint ? { sprint: sprint.id } : {}),
    });
  }

  const columnGroups = useMemo<BoardColumnGroup[]>(
    () => columns.map((column) => ({ name: column.name, columns: [column] })),
    [columns],
  );

  function chooseBoard(value: string) {
    const next = projectBoards.find((board) => board.id === Number(value));
    if (next) navigate(`/boards/${next.id}?project=${next.project}`);
  }
  return {
    detailsDrawerOpen,
    headerProps: {
      name: selectedBoard?.name,
      projectBoards,
      selectedBoardId: selectedBoard?.id,
      canManage: Boolean(selectedBoard?.can_manage),
      swimlane,
      sprintMode,
      usesSprints,
      onBack: () => navigate("/boards"),
      onBoardChange: chooseBoard,
      onConfigure: () => setConfigureWorkflow(true),
      onSwimlane: setSwimlane,
      onToggleSprintMode: () => setSprintMode((value) => !value),
      onRefresh: () => void agile.reload(),
    },
    workflowProps: {
      message,
      error: agile.error,
      blockedCount,
      loading: agile.loading,
      columns: columnGroups,
      tasks: boardTasks,
      projectColumns: columnsByProject,
      visibleProjects,
      projects: scope.projects,
      projectSelected: Boolean(boardProjectId),
      swimlane,
      onMove: (taskId: number, status: string) => void moveToColumn(taskId, status),
      onOpenTask: openStoryDetails,
    },
    detailsProps: detailsTask
      ? {
          task: detailsTask,
          projectName:
            detailsTask.project_name ??
            visibleProjects.find((project) => project.id === detailsTask.project)?.name,
          open: detailsDrawerOpen,
          onClose: closeStoryDetails,
          onUpdate: (changes: Partial<Task>) => void agile.update(detailsTask.id, changes),
          drawerClassName: "board-task-details-drawer",
        }
      : null,
    configurationProps:
      configureWorkflow && boardProjectId && selectedBoard
        ? {
            projectId: boardProjectId,
            boardId: selectedBoard.id,
            onClose: () => setConfigureWorkflow(false),
            onSaved: () => {
              void getAgileBoardColumns(boardProjectId, selectedBoard.id).then((result) =>
                setColumnsByProject((current) => ({ ...current, [boardProjectId]: result })),
              );
            },
          }
        : null,
  };
}
