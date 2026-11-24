import { ProjectDirectoryHeader } from "../../components/directory-toolbar/ProjectDirectoryHeader";
import { ProjectStatusFilter } from "../../components/directory-toolbar/ProjectStatusFilter";
import { ProjectCreateButton } from "../../components/directory-toolbar/ProjectCreateButton";
import { ProjectDirectorySearch } from "../../components/directory-toolbar/ProjectDirectorySearch";

export function ProjectDirectoryToolbar({
  search,
  statusFilter,
  createDisabled,
  onSearch,
  onStatusChange,
  onCreate,
}: {
  search: string;
  statusFilter: string;
  createDisabled: boolean;
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <ProjectDirectoryHeader>
        <ProjectStatusFilter value={statusFilter} onChange={onStatusChange} />
        <ProjectCreateButton disabled={createDisabled} onCreate={onCreate} />
      </ProjectDirectoryHeader>
      <ProjectDirectorySearch value={search} onSearch={onSearch} />
    </>
  );
}
