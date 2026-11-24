import type { WorkTaskEditorFormProps } from "../../entities/workTaskEditor";
import { WorkTaskTitleField } from "./WorkTaskTitleField";
import { WorkTaskProjectField } from "./WorkTaskProjectField";
import { WorkTaskDescriptionField } from "./WorkTaskDescriptionField";
import { WorkTaskScheduleFields } from "./WorkTaskScheduleFields";
import { WorkTaskStatusField } from "./WorkTaskStatusField";
import { WorkTaskEditorNotices } from "./WorkTaskEditorNotices";
import { WorkTaskEditorActions } from "./WorkTaskEditorActions";
export function WorkTaskEditorForm(props: WorkTaskEditorFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void props.onSubmit();
      }}
      className="my-work-form"
    >
      <WorkTaskTitleField title={props.title} onChange={props.onTitleChange} />
      <WorkTaskProjectField
        task={props.task}
        projects={props.projects}
        projectId={props.projectId}
        onChange={props.onProjectChange}
      />
      <WorkTaskDescriptionField
        description={props.description}
        onChange={props.onDescriptionChange}
      />
      <WorkTaskScheduleFields
        priority={props.priority}
        dueDate={props.dueDate}
        minDate={props.task?.planned_start_date ?? undefined}
        onPriorityChange={props.onPriorityChange}
        onDueDateChange={props.onDueDateChange}
      />
      {props.task && (
        <WorkTaskStatusField
          task={props.task}
          status={props.status}
          statuses={props.statuses}
          onChange={props.onStatusChange}
        />
      )}
      <WorkTaskEditorNotices
        editing={Boolean(props.task)}
        workflowError={props.workflowError}
        error={props.error}
      />
      <WorkTaskEditorActions
        editing={Boolean(props.task)}
        busy={props.busy}
        hasProject={Boolean(props.projectId)}
        onClose={props.onClose}
      />
    </form>
  );
}
