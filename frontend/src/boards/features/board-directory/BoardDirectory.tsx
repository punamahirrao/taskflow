import type { BoardDirectoryProps } from "../../entities/boardDirectory";
import { BoardCard } from "../../components/board-directory/BoardCard";
import { BoardDirectoryGrid } from "../../components/board-directory/BoardDirectoryGrid";
import { BoardDirectoryLoading } from "../../components/board-directory/BoardDirectoryLoading";
import { BoardDirectoryEmpty } from "../../components/board-directory/BoardDirectoryEmpty";
import { CreateBoardTile } from "../../components/board-directory/CreateBoardTile";
export function BoardDirectory(props: BoardDirectoryProps) {
  if (props.loading) return <BoardDirectoryLoading />;
  if (!props.boards.length) return <BoardDirectoryEmpty archived={props.tab === "archived"} />;
  return (
    <BoardDirectoryGrid>
      {props.boards.map((board) => {
        const project = props.projects.find((item) => item.id === board.project);
        const canManage =
          board.owner === props.userId ||
          project?.my_role === "owner" ||
          project?.my_role === "admin" ||
          project?.can_create_board;
        return (
          <BoardCard
            key={board.id}
            board={board}
            project={project}
            canManage={Boolean(canManage)}
            menuOpen={props.menuId === board.id}
            onOpen={() => props.onOpen(board)}
            onMenu={() => props.onMenu(board.id)}
            onEdit={() => props.onEdit(board)}
            onArchive={() => props.onArchive(board)}
            onProjectSettings={() => props.onProjectSettings(board)}
          />
        );
      })}
      {props.canCreate && props.tab !== "archived" && <CreateBoardTile onCreate={props.onCreate} />}
    </BoardDirectoryGrid>
  );
}
