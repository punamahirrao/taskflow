import { WorkMentionsPanel } from "../../components/mentions/WorkMentionsPanel";
import { WorkMentionsHeader } from "../../components/mentions/WorkMentionsHeader";
import { WorkMentionsPreviewList } from "../../components/mentions/WorkMentionsPreviewList";
import { WorkMentionsFooter } from "../../components/mentions/WorkMentionsFooter";
export function WorkMentionsPreview() {
  return (
    <WorkMentionsPanel>
      <WorkMentionsHeader />
      <WorkMentionsPreviewList />
      <WorkMentionsFooter />
    </WorkMentionsPanel>
  );
}
