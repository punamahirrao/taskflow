import type { SprintFilter, WorkflowTab, WorkflowTabOption } from "../../entities/sprintTrain";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { SprintTrainToolbarLayout } from "../../components/toolbar/SprintTrainToolbarLayout";
import { SprintTrainFiltersLayout } from "../../components/toolbar/SprintTrainFiltersLayout";
import { WorkflowTabs } from "../../components/toolbar/WorkflowTabs";
import { SprintTrainSearch } from "../../components/toolbar/SprintTrainSearch";
import { SprintTeamFilter } from "../../components/toolbar/SprintTeamFilter";
import { SprintFilterButtons } from "../../components/toolbar/SprintFilterButtons";
export function SprintTrainToolbar({
  activeTab,
  onTab,
  dependencyCount,
  search,
  onSearch,
  teams,
  teamFilter,
  onTeam,
  sprintFilter,
  onSprintFilter,
}: {
  activeTab: WorkflowTab;
  onTab: (tab: WorkflowTab) => void;
  dependencyCount: number;
  search: string;
  onSearch: (value: string) => void;
  teams: string[];
  teamFilter: string;
  onTeam: (value: string) => void;
  sprintFilter: SprintFilter;
  onSprintFilter: (value: SprintFilter) => void;
}) {
  const { t } = useTranslation();
  const tabs: WorkflowTabOption[] = [
    { id: "workflow", label: t("sprintTrain.tabWorkflow") },
    { id: "capacity", label: t("sprintTrain.teamCapacity") },
    {
      id: "dependencies",
      label: t(
        dependencyCount === 1
          ? "sprintTrain.tabDependenciesSingular"
          : "sprintTrain.tabDependenciesPlural",
        { count: dependencyCount },
      ),
    },
  ];
  return (
    <SprintTrainToolbarLayout>
      <WorkflowTabs tabs={tabs} activeTab={activeTab} onTab={onTab} />
      {activeTab !== "capacity" && (
        <SprintTrainFiltersLayout>
          <SprintTrainSearch search={search} onSearch={onSearch} />
          <SprintTeamFilter teams={teams} team={teamFilter} onTeam={onTeam} />
          <SprintFilterButtons value={sprintFilter} onChange={onSprintFilter} />
        </SprintTrainFiltersLayout>
      )}
    </SprintTrainToolbarLayout>
  );
}
