import type { BoardWorkflowProps } from "../../entities/workflow";
import { BoardColumnLane } from "../column-lane/BoardColumnLane";
import { BoardTask } from "../task-card/BoardTask";
import { BoardBlockedNotice } from "../../components/workflow/BoardBlockedNotice";
import { BoardWorkflowMessage } from "../../components/workflow/BoardWorkflowMessage";
import { BoardWorkflowError } from "../../components/workflow/BoardWorkflowError";
import { BoardWorkflowLoading } from "../../components/workflow/BoardWorkflowLoading";
import { BoardWorkflowGrid } from "../../components/workflow/BoardWorkflowGrid";
export function BoardWorkflowFeature(props: BoardWorkflowProps) {
  const groups = props.columns.map((group) => {
    const tasks = props.tasks.filter((task) =>
      group.columns.some((column) =>
        column.statuses
          ? column.statuses.some((status) => task.status === status.key)
          : task.status === column.key,
      ),
    );
    const overLimit = props.visibleProjects.some((project) =>
      group.columns.some((column) => {
        const projectColumn = (props.projectColumns[project.id] ?? []).find(
          (item) => item.id === column.id,
        );
        const statusKeys = column.statuses?.map((status) => status.key) ?? [column.key];
        const count = tasks.filter(
          (task) => task.project === project.id && statusKeys.includes(task.status),
        ).length;
        return projectColumn?.wip_limit != null && count > projectColumn.wip_limit;
      }),
    );
    const aggregateLimit = props.visibleProjects.reduce(
      (total, project) =>
        total +
        group.columns.reduce(
          (subtotal, column) =>
            subtotal +
            ((props.projectColumns[project.id] ?? []).find((item) => item.id === column.id)
              ?.wip_limit ?? 0),
          0,
        ),
      0,
    );

    return { group, tasks, overLimit, aggregateLimit };
  });
  return (
    <>
      {props.blockedCount > 0 && <BoardBlockedNotice count={props.blockedCount} />}
      {props.message && <BoardWorkflowMessage message={props.message} />}
      {props.error && <BoardWorkflowError error={props.error} />}
      {props.loading || !props.columns.length ? (
        <BoardWorkflowLoading loading={props.loading} />
      ) : (
        <BoardWorkflowGrid count={props.columns.length}>
          {groups.map(({ group, tasks, overLimit, aggregateLimit }) => (
            <BoardColumnLane
              key={group.name}
              groupName={group.name}
              columns={group.columns}
              tasks={tasks}
              swimlane={props.swimlane}
              projects={props.projects}
              projectSelected={props.projectSelected}
              canCustomize={false}
              busy={false}
              overLimit={overLimit}
              aggregateLimit={aggregateLimit}
              onSaveLimit={() => undefined}
              onMove={props.onMove}
              renderTask={(task) => (
                <BoardTask key={task.id} task={task} onOpen={() => props.onOpenTask(task.id)} />
              )}
            />
          ))}
        </BoardWorkflowGrid>
      )}
    </>
  );
}
