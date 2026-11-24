import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAgileBoard, updateAgileBoard } from "../../../features/tasks/api/boards";
import type { AgileBoard } from "../../../features/tasks/entities/task";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { filterAndSortBoards, type BoardSortKey, type BoardTab } from "../../utils/boardDashboard";
import { firstValidationError, boardSchema } from "../../../common/validation/schemas";
import { useToast } from "../../../common/features/notifications/useToast";
import { useAppSelector } from "../../../common/store";
import { dataScope } from "../../../common/api/queryApi";
import { useBoardDirectoryQuery } from "../../api/boardDirectory";
import type { BoardFormValues } from "../../entities/boardForm";
const emptyBoards: AgileBoard[] = [];
export function useBoardsDirectory() {
  const { t } = useTranslation();
  const toast = useToast();
  const user = useAppSelector((state) => state.session.user);
  const navigate = useNavigate();
  const { projects, selectedId, loading: projectsLoading } = useProjectContext();
  const directory = useBoardDirectoryQuery(dataScope(), { skip: projectsLoading });
  const boards = directory.currentData?.active ?? emptyBoards;
  const archivedBoards = directory.currentData?.archived ?? emptyBoards;
  const loading = projectsLoading || directory.isLoading;
  const boardLoadError = directory.error
    ? ("message" in directory.error && directory.error.message) || t("boards.directoryLoadFailed")
    : "";
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<BoardSortKey>("updated");
  const [tab, setTab] = useState<BoardTab>("all");
  const [showForm, setShowForm] = useState(false);
  const [editBoard, setEditBoard] = useState<AgileBoard | null>(null);
  const [form, setForm] = useState<BoardFormValues>({
    name: "",
    description: "",
    project: "",
    type: "scrum",
    members: [],
  });
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<number | null>(null);
  const canCreate = projects.some(
    (project) => project.id === selectedId && project.can_create_board,
  );

  async function reload() {
    setError("");
    await directory.refetch();
  }

  const visible = useMemo(
    () =>
      filterAndSortBoards({
        boards,
        archivedBoards,
        projects,
        userId: user?.id,
        tab,
        selectedId,
        typeFilter,
        search,
        sort,
      }),
    [boards, archivedBoards, projects, user?.id, tab, selectedId, typeFilter, search, sort],
  );
  function openCreate() {
    setEditBoard(null);
    setForm({
      name: "",
      description: "",
      project: String(selectedId ?? ""),
      type: "scrum",
      members: [],
    });
    setShowForm(true);
  }
  function openEdit(board: AgileBoard) {
    setEditBoard(board);
    setForm({
      name: board.name,
      description: board.description,
      project: String(board.project),
      type: board.board_type,
      members: board.members.map((member) => member.id).filter((id) => id !== board.owner),
    });
    setShowForm(true);
    setMenu(null);
  }
  async function submitBoard() {
    const validationError = firstValidationError(boardSchema, form);
    if (validationError) {
      setError(validationError);
      toast("error", validationError);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editBoard)
        await updateAgileBoard(Number(form.project), editBoard.id, {
          name: form.name.trim(),
          description: form.description,
          board_type: form.type,
          member_ids: form.members,
        });
      else
        await createAgileBoard(Number(form.project), {
          name: form.name.trim(),
          description: form.description,
          board_type: form.type,
          member_ids: form.members,
        });
      toast(
        "success",
        editBoard ? t("boards.boardSaved") : t("boards.boardCreated", { name: form.name.trim() }),
      );
      setShowForm(false);
      await reload();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("boards.errCreateBoard");
      setError(message);
      toast("error", message);
    } finally {
      setBusy(false);
    }
  }
  async function archive(board: AgileBoard) {
    setMenu(null);
    try {
      await updateAgileBoard(board.project, board.id, { is_archived: true });
      toast("success", t("boards.boardArchived", { name: board.name }));
      await reload();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("boards.directoryLoadFailed");
      setError(message);
      toast("error", message);
    }
  }

  return {
    headerProps: { canCreate, onCreate: openCreate },
    error: error || boardLoadError,
    filterProps: {
      search,
      type: typeFilter,
      sort,
      tab,
      onSearch: setSearch,
      onType: setTypeFilter,
      onSort: setSort,
      onTab: setTab,
    },
    directoryProps: {
      boards: visible,
      projects,
      userId: user?.id,
      menuId: menu,
      canCreate,
      tab,
      loading,
      onOpen: (board: AgileBoard) => navigate(`/boards/${board.id}?project=${board.project}`),
      onMenu: (id: number) => setMenu(menu === id ? null : id),
      onEdit: openEdit,
      onArchive: (board: AgileBoard) => void archive(board),
      onProjectSettings: (board: AgileBoard) => {
        navigate(`/project/${board.project}/settings`);
        setMenu(null);
      },
      onCreate: openCreate,
    },
    formProps: showForm
      ? {
          projects,
          values: form,
          editing: editBoard,
          busy,
          error,
          onChange: (values: Partial<BoardFormValues>) =>
            setForm((current) => ({ ...current, ...values })),
          onSubmit: () => void submitBoard(),
          onCancel: () => setShowForm(false),
        }
      : null,
  };
}
