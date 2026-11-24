import { PaddedPage } from "../../../common/components/styled";
import type { usePlanningPageModel } from "../../features/records/usePlanningPageModel";
import { PlanningForm } from "../../features/planning-form/PlanningForm";
import { MilestonePermissionsNotice } from "./MilestonePermissionsNotice";
import { PlanningHeader } from "./PlanningHeader";
import { PlanningLoadError } from "./PlanningLoadError";
import { PlanningLoading } from "./PlanningLoading";
import { PlanningRecordsTable } from "./PlanningRecordsTable";
import { ShowAllGoalsLink } from "./ShowAllGoalsLink";
const labels = {
  release: "Releases",
  goal: "Goals",
  milestone: "Milestones",
  template: "Templates",
};

export function PlanningPageView({ model }: { model: ReturnType<typeof usePlanningPageModel> }) {
  const {
    currentData,
    isFetching,
    error,
    selectedGoal,
    search,
    setSearch,
    editing,
    setEditing,
    kind,
  } = model;
  return (
    <PaddedPage>
      <PlanningHeader model={model} />
      {currentData && !currentData.can_manage && kind === "milestone" && (
        <MilestonePermissionsNotice />
      )}
      <input
        type="search"
        aria-label={`Search ${labels[kind]}`}
        placeholder={`Search ${labels[kind].toLowerCase()}…`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-5 w-full max-w-md rounded border border-line bg-surface p-3 text-sm"
      />
      {selectedGoal && <ShowAllGoalsLink />}
      {error ? (
        <PlanningLoadError model={model} />
      ) : !currentData && isFetching ? (
        <PlanningLoading />
      ) : (
        <PlanningRecordsTable model={model} />
      )}
      {editing && (
        <PlanningForm
          key={editing === "new" ? "new" : editing.id}
          kind={kind}
          item={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </PaddedPage>
  );
}
