import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { WorkflowTab, WorkflowTabOption } from "../../entities/sprintTrain";
import { WorkflowTabButton } from "./WorkflowTabButton";

export function WorkflowTabs({
  tabs,
  activeTab,
  onTab,
}: {
  tabs: WorkflowTabOption[];
  activeTab: WorkflowTab;
  onTab: (tab: WorkflowTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("sprintTrain.viewsNav")} className="flex flex-wrap gap-1">
      {tabs.map((tab) => (
        <WorkflowTabButton key={tab.id} tab={tab} active={activeTab === tab.id} onSelect={onTab} />
      ))}
    </nav>
  );
}
