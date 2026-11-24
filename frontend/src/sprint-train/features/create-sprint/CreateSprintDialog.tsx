import type { SprintCreationProps } from "../../entities/sprintCreation";
import { CreateSprintPanel } from "../../components/create-sprint/CreateSprintPanel";
import { CreateSprintHeader } from "../../components/create-sprint/CreateSprintHeader";
import { CreateSprintForm } from "../../components/create-sprint/CreateSprintForm";
import { CreateSprintProject } from "../../components/create-sprint/CreateSprintProject";
import { CreateSprintNameField } from "../../components/create-sprint/CreateSprintNameField";
import { CreateSprintDateFields } from "../../components/create-sprint/CreateSprintDateFields";
import { CreateSprintCapacityField } from "../../components/create-sprint/CreateSprintCapacityField";
import { CreateSprintGoalField } from "../../components/create-sprint/CreateSprintGoalField";
import { CreateSprintActiveField } from "../../components/create-sprint/CreateSprintActiveField";
import { CreateSprintError } from "../../components/create-sprint/CreateSprintError";
import { CreateSprintActions } from "../../components/create-sprint/CreateSprintActions";
export function CreateSprintDialog(props: SprintCreationProps) {
  return (
    <CreateSprintPanel saving={props.saving} onClose={props.onClose}>
      <CreateSprintHeader saving={props.saving} onClose={props.onClose} />
      <CreateSprintForm onSubmit={props.onSubmit}>
        <CreateSprintProject project={props.project} />
        <CreateSprintNameField value={props.name} onChange={props.onName} />
        <CreateSprintDateFields
          start={props.start}
          end={props.end}
          onStart={props.onStart}
          onEnd={props.onEnd}
        />
        <CreateSprintCapacityField value={props.capacity} onChange={props.onCapacity} />
        <CreateSprintGoalField value={props.goal} onChange={props.onGoal} />
        <CreateSprintActiveField active={props.active} onChange={props.onActive} />
        {props.error && <CreateSprintError error={props.error} />}
        <CreateSprintActions
          saving={props.saving}
          hasProject={props.hasProjectSelection}
          onClose={props.onClose}
        />
      </CreateSprintForm>
    </CreateSprintPanel>
  );
}
