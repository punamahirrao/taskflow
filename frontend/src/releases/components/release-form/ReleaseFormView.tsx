import { useEffect, useRef } from "react";
import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
import { ReleaseFormFields } from "./ReleaseFormFields";
import { ReleaseFormHeader } from "./ReleaseFormHeader";
export function ReleaseFormView({ model }: { model: ReturnType<typeof useReleaseFormModel> }) {
  const { saveState, onClose } = model;
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="release-dialog"
      aria-labelledby="release-form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saveState.isLoading) onClose();
      }}
    >
      <ReleaseFormHeader model={model} />
      <ReleaseFormFields model={model} />
    </dialog>
  );
}
