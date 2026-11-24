import { BoardWorkspaceLayout } from "./components/workspace-layout/BoardWorkspaceLayout";
import { BoardWorkspaceHeader } from "./features/workspace-header/BoardWorkspaceHeader";
import { BoardWorkflowFeature } from "./features/workflow/BoardWorkflowFeature";
import { useBoardWorkspace } from "./features/hooks/useBoardWorkspace";
import { SprintStoryDetailsDrawer } from "../sprint-train/features/story-details/SprintStoryDetailsDrawer";
import { WorkflowConfigDialog } from "../project-detail/components/WorkflowConfigDialog";
export default function BoardsPage() {
  const board = useBoardWorkspace();
  return (
    <BoardWorkspaceLayout drawerOpen={board.detailsDrawerOpen}>
      <BoardWorkspaceHeader {...board.headerProps} />
      <BoardWorkflowFeature {...board.workflowProps} />
      {board.detailsProps && <SprintStoryDetailsDrawer {...board.detailsProps} />}
      {board.configurationProps && <WorkflowConfigDialog {...board.configurationProps} />}
    </BoardWorkspaceLayout>
  );
}
