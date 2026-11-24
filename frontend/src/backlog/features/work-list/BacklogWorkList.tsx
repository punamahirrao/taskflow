import type { BacklogWorkListProps } from "../../entities/backlogWork";
import { BacklogLoadingState } from "../../components/work-list/BacklogLoadingState";
import { BacklogEmptyState } from "../../components/work-list/BacklogEmptyState";
import { BacklogGroupsLayout } from "../../components/work-list/BacklogGroupsLayout";
import { BacklogGroupSection } from "../../components/work-list/BacklogGroupSection";
import { BacklogGroupHeader } from "../../components/work-list/BacklogGroupHeader";
import { BacklogGroupItems } from "../../components/work-list/BacklogGroupItems";
import { BacklogWorkItem } from "./BacklogWorkItem";

export function BacklogWorkList({
  loading,
  backlog,
  tasks,
  projects,
  groups,
  activeSprint,
  sprintBusy,
  epicRollups,
  onCapture,
  onReorder,
  reordering = false,
  onUpdate,
  onEdit,
}: BacklogWorkListProps) {
  if (loading) return <BacklogLoadingState />;
  if (!backlog.length) return <BacklogEmptyState onCapture={onCapture} />;
  return (
    <BacklogGroupsLayout>
      {groups.map(([name, items, key]) => (
        <BacklogGroupSection key={key} name={name}>
          <BacklogGroupHeader name={name} count={items.length} />
          <BacklogGroupItems>
            {items.map((task) => (
              <BacklogWorkItem
                key={task.id}
                task={task}
                backlog={backlog}
                tasks={tasks}
                projects={projects}
                activeSprint={activeSprint}
                sprintBusy={sprintBusy}
                rollup={epicRollups.get(task.id)}
                onReorder={onReorder}
                reordering={reordering}
                onUpdate={onUpdate}
                onEdit={onEdit}
              />
            ))}
          </BacklogGroupItems>
        </BacklogGroupSection>
      ))}
    </BacklogGroupsLayout>
  );
}
