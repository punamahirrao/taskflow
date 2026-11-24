import { WorkTaskFilters } from "../../components/tasks/WorkTaskFilters";
import { WorkTaskSearch } from "../../components/tasks/WorkTaskSearch";
import { WorkTasksFooter } from "../../components/tasks/WorkTasksFooter";
import { WorkTasksHeader } from "../../components/tasks/WorkTasksHeader";
import { WorkTasksPanel } from "../../components/tasks/WorkTasksPanel";
import { WorkTasksTable } from "../../components/tasks/WorkTasksTable";
import { WorkTasksToolbar } from "../../components/tasks/WorkTasksToolbar";
import type { WorkTasksProps } from "../../entities/workTasks";
import { canWriteWork } from "../../utils/workPermissions";

export function WorkTasks({
  tasks,
  grouped,
  filter,
  search,
  projectsById,
  savingId,
  today,
  canCreate,
  needsProject,
  overview = false,
  onFilterChange,
  onSearchChange,
  onCreate,
  onTask,
  onComplete,
  onView,
}: WorkTasksProps) {
  const visibleTasks = overview ? tasks.slice(0, 6) : tasks;
  const rows = visibleTasks.map((task) => {
    const project = projectsById.get(task.project);
    return { task, project, canEdit: canWriteWork(project?.my_role) };
  });
  return (
    <WorkTasksPanel>
      <WorkTasksHeader
        openCount={grouped.Open.length}
        overview={overview}
        canCreate={canCreate}
        needsProject={needsProject}
        onCreate={onCreate}
        onView={onView}
      />
      <WorkTasksToolbar>
        <WorkTaskFilters grouped={grouped} filter={filter} onSelect={onFilterChange} />
        <WorkTaskSearch search={search} onSearch={onSearchChange} />
      </WorkTasksToolbar>
      <WorkTasksTable
        rows={rows}
        today={today}
        savingId={savingId}
        search={search}
        filter={filter}
        onTask={onTask}
        onComplete={onComplete}
      />
      {overview && tasks.length > visibleTasks.length && (
        <WorkTasksFooter
          visibleCount={visibleTasks.length}
          totalCount={tasks.length}
          onView={onView}
        />
      )}
    </WorkTasksPanel>
  );
}
