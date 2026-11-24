import { SprintTrainPageLayout } from "./components/layout/SprintTrainPageLayout";
import { SprintTrainColumns } from "./components/layout/SprintTrainColumns";
import { SprintWorkflowLayout } from "./components/workflow/SprintWorkflowLayout";
import { SprintTrainFeedback } from "./components/feedback/SprintTrainFeedback";
import { SprintTrainHeader } from "./features/header/SprintTrainHeader";
import { SprintTrainToolbar } from "./features/toolbar/SprintTrainToolbar";
import { SprintPipeline } from "./features/pipeline/SprintPipeline";
import { SprintStories } from "./features/sprint-stories/SprintStories";
import { SprintDependencies } from "./features/dependencies/SprintDependencies";
import { BacklogDrawer } from "./features/backlog-drawer/BacklogDrawer";
import { SprintStoryDetailsDrawer } from "./features/story-details/SprintStoryDetailsDrawer";
import TeamCapacity from "./features/team-capacity/TeamCapacity";
import { CreateSprintDialog } from "./features/create-sprint/CreateSprintDialog";
import { useSprintTrainPage } from "./features/hooks/useSprintTrainPage";

export default function SprintTrainPage() {
  const page = useSprintTrainPage();
  return (
    <SprintTrainPageLayout drawerOpen={page.drawerOpen}>
      <SprintTrainColumns
        content={
          <>
            <SprintTrainHeader {...page.headerProps} />
            <SprintTrainToolbar {...page.toolbarProps} />
            <SprintTrainFeedback {...page.feedbackProps} />
            {page.activeTab === "workflow" && (
              <SprintWorkflowLayout>
                <SprintPipeline {...page.pipelineProps} />
                <SprintStories {...page.storiesProps} />
              </SprintWorkflowLayout>
            )}
            {page.activeTab === "capacity" && <TeamCapacity {...page.capacityProps} />}
            {page.activeTab === "dependencies" && (
              <SprintDependencies {...page.dependenciesProps} />
            )}
          </>
        }
        backlog={<BacklogDrawer {...page.backlogProps} />}
      />
      {page.detailsProps && <SprintStoryDetailsDrawer {...page.detailsProps} />}
      {page.creationProps && <CreateSprintDialog {...page.creationProps} />}
    </SprintTrainPageLayout>
  );
}
