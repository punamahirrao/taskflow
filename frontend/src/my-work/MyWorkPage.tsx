import { WorkContent } from "./components/layout/WorkContent";
import { WorkLoadingState } from "./components/layout/WorkLoadingState";
import { WorkPageLayout } from "./components/layout/WorkPageLayout";
import { WorkTaskLoadError } from "./components/layout/WorkTaskLoadError";
import { WorkMentionsLayout } from "./components/mentions/WorkMentionsLayout";
import { WorkOverviewLayout } from "./components/overview/WorkOverviewLayout";
import { WorkActivity } from "./features/activity/WorkActivity";
import { WorkApprovals } from "./features/approvals/WorkApprovals";
import { WorkAgenda } from "./features/calendar/WorkAgenda";
import { WorkDocuments } from "./features/documents/WorkDocuments";
import { useMyWork } from "./features/hooks/useMyWork";
import { WorkMentionsPreview } from "./features/mentions/WorkMentionsPreview";
import { WorkNavigation } from "./features/navigation/WorkNavigation";
import { WorkProjects } from "./features/projects/WorkProjects";
import { WorkTaskEditor } from "./features/task-editor/WorkTaskEditor";
import { WorkTaskSummary } from "./features/task-summary/WorkTaskSummary";
import { WorkTasks } from "./features/tasks/WorkTasks";
import { WorkTime } from "./features/time/WorkTime";

export default function MyWorkPage() {
  const work = useMyWork();

  return (
    <WorkPageLayout>
      <WorkNavigation activeTab={work.activeTab} />
      {work.error && <WorkTaskLoadError onRetry={work.refetch} />}
      {work.loading ? (
        <WorkLoadingState />
      ) : (
        <WorkContent>
          {work.showOverview && (
            <WorkOverviewLayout
              summary={<WorkTaskSummary {...work.summaryProps} />}
              tasks={<WorkTasks {...work.taskProps} overview />}
              calendar={
                <WorkAgenda
                  tasks={work.tasks}
                  onTask={work.openTask}
                  onView={() => work.showTab("calendar")}
                />
              }
              approvals={<WorkApprovals onView={() => work.showTab("approvals")} />}
              time={
                <WorkTime storageKey={work.timeStorageKey} onView={() => work.showTab("time")} />
              }
              activity={
                <WorkActivity
                  scope={work.scope}
                  tasks={work.tasks}
                  onTask={work.openTask}
                  onView={() => work.showTab("mentions")}
                />
              }
            />
          )}
          {work.activeTab === "tasks" && <WorkTasks {...work.taskProps} />}
          {work.activeTab === "calendar" && (
            <WorkAgenda
              full
              tasks={work.tasks}
              onTask={work.openTask}
              onView={() => work.showTab("calendar")}
            />
          )}
          {work.activeTab === "time" && (
            <WorkTime full storageKey={work.timeStorageKey} onView={() => work.showTab("time")} />
          )}
          {work.activeTab === "projects" && (
            <WorkProjects projects={work.myProjects} tasks={work.tasks} />
          )}
          {work.activeTab === "documents" && <WorkDocuments scope={work.scope} />}
          {work.activeTab === "approvals" && <WorkApprovals full />}
          {work.activeTab === "mentions" && (
            <WorkMentionsLayout>
              <WorkActivity
                full
                scope={work.scope}
                tasks={work.tasks}
                onTask={work.openTask}
                onView={() => work.showTab("mentions")}
              />
              <WorkMentionsPreview />
            </WorkMentionsLayout>
          )}
        </WorkContent>
      )}
      {work.editorProps && <WorkTaskEditor {...work.editorProps} />}
    </WorkPageLayout>
  );
}
