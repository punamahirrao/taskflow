import { BoardsDirectoryHeaderLayout } from "../../components/directory-header/BoardsDirectoryHeaderLayout";
import { CreateBoardButton } from "../../components/directory-header/CreateBoardButton";
export function BoardsDirectoryHeader({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <BoardsDirectoryHeaderLayout>
      {canCreate && <CreateBoardButton onCreate={onCreate} />}
    </BoardsDirectoryHeaderLayout>
  );
}
