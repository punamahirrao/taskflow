import { EditWorkItemDialog } from "../features/tasks/components/EditWorkItemDialog";
import { BacklogPageLayout } from "./components/layout/BacklogPageLayout";
import { BacklogHeader } from "./features/header/BacklogHeader";
import { BacklogHealthSummary } from "./features/health-summary/BacklogHealthSummary";
import { useBacklogPage } from "./features/hooks/useBacklogPage";
import { QuickCaptureDialog } from "./features/quick-capture/QuickCaptureDialog";
import { BacklogWorkspace } from "./features/workspace/BacklogWorkspace";

export default function BacklogPage() {
  const page = useBacklogPage();
  return (
    <BacklogPageLayout>
      <BacklogHeader onCapture={page.openCapture} />
      <BacklogHealthSummary {...page.healthProps} />
      <BacklogWorkspace {...page.workspaceProps} />
      {page.captureProps && <QuickCaptureDialog {...page.captureProps} />}
      {page.editorProps && <EditWorkItemDialog {...page.editorProps} />}
    </BacklogPageLayout>
  );
}
