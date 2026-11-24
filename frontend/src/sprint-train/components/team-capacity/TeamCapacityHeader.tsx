import type { TeamCapacityProps } from "../../entities/capacityPlanning";

export function TeamCapacityHeader({
  sprints,
  selectedSprint,
  onSelectSprint,
}: Pick<TeamCapacityProps, "sprints" | "selectedSprint" | "onSelectSprint">) {
  return (
    <header className="capacity-heading">
      <h2>Team capacity</h2>
      <label>
        Sprint
        <select
          value={selectedSprint?.id ?? ""}
          onChange={(event) => onSelectSprint(Number(event.target.value))}
          disabled={!sprints.length}
        >
          {!sprints.length && <option value="">No sprints</option>}
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
