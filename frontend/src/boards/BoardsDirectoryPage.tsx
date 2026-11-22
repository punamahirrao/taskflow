import { useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createAgileBoard, updateAgileBoard } from "../features/tasks/api/boards";
import type { AgileBoard } from "../features/tasks/entities/task";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { BoardCard } from "./components/BoardCard";
import { BoardFilters } from "./components/BoardFilters";
import { BoardForm, type BoardFormValues } from "./components/BoardForm";
import { BoardPageHeader, BoardPageTitle, BoardPageShell } from "./BoardPageLayout.styles";
import { filterAndSortBoards, type BoardSortKey, type BoardTab } from "./utils/boardDashboard";
import { firstValidationError, boardSchema } from "../common/validation/schemas";
import { useToast } from "../common/features/notifications/useToast";
import { useAppSelector } from "../common/store";
import { dataScope } from "../common/api/queryApi";
import { useBoardDirectoryQuery } from "./api/boardDirectory";

const emptyBoards: AgileBoard[] = [];

export default function BoardsDirectoryPage() {
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
  async function submitBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <BoardPageShell>
      <div className="mx-auto max-w-[1500px]">
        <BoardPageHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">TaskFlow</p>
            <BoardPageTitle>{t("boards.title")}</BoardPageTitle>
            <p className="mt-2 text-sm text-muted">{t("boards.directorySubtitle")}</p>
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
            >
              <Plus size={17} />
              {t("boards.createBoard")}
            </button>
          )}
        </BoardPageHeader>
        {(error || boardLoadError) && (
          <p role="alert" className="mb-4 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
            {error || boardLoadError}
          </p>
        )}
        <BoardFilters
          search={search}
          type={typeFilter}
          sort={sort}
          tab={tab}
          onSearch={setSearch}
          onType={setTypeFilter}
          onSort={setSort}
          onTab={setTab}
        />
        {loading ? (
          <p
            role="status"
            className="rounded-xl border border-line bg-surface p-12 text-center text-sm text-muted"
          >
            {t("common.loading")}
          </p>
        ) : visible.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((board) => {
              const project = projects.find((item) => item.id === board.project);
              const canManage =
                board.owner === user?.id ||
                project?.my_role === "owner" ||
                project?.my_role === "admin" ||
                project?.can_create_board;
              return (
                <BoardCard
                  key={board.id}
                  board={board}
                  project={project}
                  canManage={Boolean(canManage)}
                  menuOpen={menu === board.id}
                  onOpen={() => navigate(`/boards/${board.id}?project=${board.project}`)}
                  onMenu={() => setMenu(menu === board.id ? null : board.id)}
                  onEdit={() => openEdit(board)}
                  onArchive={() => void archive(board)}
                  onProjectSettings={() => {
                    navigate(`/project/${board.project}/settings`);
                    setMenu(null);
                  }}
                />
              );
            })}
            {canCreate && tab !== "archived" && (
              <button
                type="button"
                onClick={openCreate}
                className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-accent/40 bg-surface p-8 text-center hover:bg-accent/5"
              >
                <span>
                  <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
                    <Plus />
                  </span>
                  <b className="block text-content">{t("boards.createNewBoard")}</b>
                  <small className="mt-2 block text-muted">{t("boards.createBoardHint")}</small>
                </span>
              </button>
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-line bg-surface p-12 text-center text-sm text-muted">
            {t(tab === "archived" ? "boards.noArchivedBoards" : "boards.noBoards")}
          </p>
        )}
        {showForm && (
          <BoardForm
            projects={projects}
            values={form}
            editing={editBoard}
            busy={busy}
            error={error}
            onChange={(values) => setForm((current) => ({ ...current, ...values }))}
            onSubmit={(event) => void submitBoard(event)}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </BoardPageShell>
  );
}
