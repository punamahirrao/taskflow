import type { CreateProjectFormContentProps } from "../../entities/createProject";
import { CreateProjectForm } from "../../Projects.styles";
import { CreateProjectFormFields } from "./CreateProjectFormFields";
import { CreateProjectFormError } from "./CreateProjectFormError";
import { CreateProjectFormActions } from "./CreateProjectFormActions";

export default function CreateProjectFormContent({
  onSubmit,
  onCancel,
  submitting,
  error,
  ...fields
}: CreateProjectFormContentProps) {
  return (
    <CreateProjectForm
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <CreateProjectFormFields {...fields} />
      {error && <CreateProjectFormError message={error} />}
      <CreateProjectFormActions submitting={submitting} onCancel={onCancel} />
    </CreateProjectForm>
  );
}
