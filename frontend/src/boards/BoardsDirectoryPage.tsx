import { BoardsDirectoryLayout } from "./components/directory-layout/BoardsDirectoryLayout";
import { BoardsDirectoryError } from "./components/directory-layout/BoardsDirectoryError";
import { BoardsDirectoryHeader } from "./features/directory-header/BoardsDirectoryHeader";
import { BoardFilters } from "./features/directory-filters/BoardFilters";
import { BoardDirectory } from "./features/board-directory/BoardDirectory";
import { BoardForm } from "./features/board-form/BoardForm";
import { useBoardsDirectory } from "./features/hooks/useBoardsDirectory";
export default function BoardsDirectoryPage() {
  const directory = useBoardsDirectory();
  return (
    <BoardsDirectoryLayout>
      <BoardsDirectoryHeader {...directory.headerProps} />
      {directory.error && <BoardsDirectoryError error={directory.error} />}
      <BoardFilters {...directory.filterProps} />
      <BoardDirectory {...directory.directoryProps} />
      {directory.formProps && <BoardForm {...directory.formProps} />}
    </BoardsDirectoryLayout>
  );
}
