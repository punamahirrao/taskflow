import type { FormEvent } from "react";
import type { Project } from "../../common/entities/project";
import type { AgileBoard, AgileBoardType } from "../../common/entities/task";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { BoardSelectField, BoardTextField, BoardTextareaField } from "./BoardFormField";

export interface BoardFormValues { name: string; description: string; project: string; type: AgileBoardType; members: number[] }
interface BoardFormProps {
  projects: Project[]; values: BoardFormValues; editing: AgileBoard | null; busy: boolean; error: string;
  onChange: (values: Partial<BoardFormValues>) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function BoardForm({ projects, values, editing, busy, error, onChange, onSubmit, onCancel }: BoardFormProps) {
  const { t } = useTranslation();
  const selectedProject = projects.find((project) => project.id === Number(values.project));
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <form onSubmit={onSubmit} aria-busy={busy} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-line bg-surface p-6 text-content shadow-xl">
      <h2 className="text-xl font-bold">{t(editing ? "boards.editBoard" : "boards.createBoard")}</h2>
      {error && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
      <BoardTextField id="board-name" testId="board-name" label={t("boards.boardName")} required maxLength={100} value={values.name} onChange={(event) => onChange({ name: event.target.value })} />
      <BoardTextareaField id="board-description" testId="board-description" label={t("boards.boardDescription")} rows={3} value={values.description} onChange={(event) => onChange({ description: event.target.value })} />
      {selectedProject && <p className="text-sm text-muted">{t("app.project")}: <span className="font-semibold text-content">{selectedProject.name}</span></p>}
      <BoardSelectField id="board-type" testId="board-type" label={t("boards.boardType")} value={values.type} onChange={(event) => onChange({ type: event.target.value as AgileBoardType })}><option value="scrum">Scrum</option><option value="kanban">Kanban</option></BoardSelectField>
      {selectedProject?.members && <BoardSelectField id="board-members" testId="board-members" label={t("boards.members")} multiple value={values.members.map(String)} className="h-28" onChange={(event) => onChange({ members: Array.from(event.target.selectedOptions, (option) => Number(option.value)) })}>{selectedProject.members.map((member) => <option key={member.id} value={member.id}>{member.first_name} {member.last_name} ({member.email})</option>)}</BoardSelectField>}
      <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2 text-sm text-content">{t("common.cancel")}</button><button disabled={busy} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? t("common.saving") : t("common.save")}</button></div>
    </form>
  </div>;
}
