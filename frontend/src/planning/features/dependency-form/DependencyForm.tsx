import { DependencyFormView } from "../../components/dependency-form/DependencyFormView";
import { useDependencyFormModel } from "./useDependencyFormModel";
export function DependencyForm({
  tasks,
  editableProjects,
  selectedProjectId,
  onClose,
}: Parameters<typeof useDependencyFormModel>[0]) {
  const model = useDependencyFormModel({ tasks, editableProjects, selectedProjectId, onClose });
  return <DependencyFormView model={model} />;
}
