import type { BoardFormProps } from "../../entities/boardForm";
export type { BoardFormValues } from "../../entities/boardForm";
import { BoardFormFrame } from "../../components/board-form/BoardFormFrame";
import { BoardFormHeading } from "../../components/board-form/BoardFormHeading";
import { BoardFormError } from "../../components/board-form/BoardFormError";
import { BoardNameField } from "../../components/board-form/BoardNameField";
import { BoardDescriptionField } from "../../components/board-form/BoardDescriptionField";
import { BoardFormProject } from "../../components/board-form/BoardFormProject";
import { BoardTypeField } from "../../components/board-form/BoardTypeField";
import { BoardMembersField } from "../../components/board-form/BoardMembersField";
import { BoardFormActions } from "../../components/board-form/BoardFormActions";

export function BoardForm({
  projects,
  values,
  editing,
  busy,
  error,
  onChange,
  onSubmit,
  onCancel,
}: BoardFormProps) {
  const selectedProject = projects.find((project) => project.id === Number(values.project));
  return (
    <BoardFormFrame busy={busy} onSubmit={onSubmit}>
      <BoardFormHeading editing={Boolean(editing)} />
      {error && <BoardFormError error={error} />}
      <BoardNameField values={values} onChange={onChange} />
      <BoardDescriptionField values={values} onChange={onChange} />
      {selectedProject && <BoardFormProject name={selectedProject.name} />}
      <BoardTypeField values={values} onChange={onChange} />
      {selectedProject?.members && (
        <BoardMembersField members={selectedProject.members} values={values} onChange={onChange} />
      )}
      <BoardFormActions busy={busy} onCancel={onCancel} />
    </BoardFormFrame>
  );
}
