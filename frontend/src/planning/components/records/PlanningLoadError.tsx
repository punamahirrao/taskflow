import type { usePlanningPageModel } from "../../features/records/usePlanningPageModel";
export function PlanningLoadError({ model }: { model: ReturnType<typeof usePlanningPageModel> }) {
  const { refetch } = model;
  return (
    <p role="alert">
      Could not load records.{" "}
      <button type="button" onClick={() => void refetch()}>
        Try again
      </button>
    </p>
  );
}
