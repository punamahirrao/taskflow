import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
import { ReleaseNameAndDateFields } from "./ReleaseNameAndDateFields";
import { ReleaseDescriptionField } from "./ReleaseDescriptionField";
import { ReleaseLinkedWorkFields } from "./ReleaseLinkedWorkFields";
import { ReleaseApprovalStepsFields } from "./ReleaseApprovalStepsFields";
import { ReleaseFormActions } from "./ReleaseFormActions";

export function ReleaseFormFields({ model }: { model: ReturnType<typeof useReleaseFormModel> }) {
  const { error, submit } = model;
  return (
    <form
      className="release-form"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <ReleaseNameAndDateFields model={model} />
      <ReleaseDescriptionField model={model} />
      <ReleaseLinkedWorkFields model={model} />
      <ReleaseApprovalStepsFields model={model} />
      {error && (
        <p className="release-error" role="alert">
          {error}
        </p>
      )}
      <ReleaseFormActions model={model} />
    </form>
  );
}
