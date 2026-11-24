import type { SprintTrainHeaderProps } from "../../entities/header";
import { SprintTrainHeaderLayout } from "../../components/header/SprintTrainHeaderLayout";
import { SprintTrainBrand } from "../../components/header/SprintTrainBrand";
import { SprintTrainActions } from "../../components/header/SprintTrainActions";
export function SprintTrainHeader({
  projectName,
  role,
  sectionLabel,
  ...actions
}: SprintTrainHeaderProps) {
  return (
    <SprintTrainHeaderLayout>
      <SprintTrainBrand projectName={projectName} role={role} sectionLabel={sectionLabel} />
      <SprintTrainActions {...actions} />
    </SprintTrainHeaderLayout>
  );
}
