import type { ReactNode } from "react";
import { useDialogBehavior } from "../../../common/shared/hooks/useDialogBehavior";
import { CreateProjectOverlay, CreateProjectPanel } from "../../Projects.styles";

export function ProjectDialogFrame({
  children,
  titleId,
  descriptionId,
  busy,
  onClose,
}: {
  children: ReactNode;
  titleId: string;
  descriptionId?: string;
  busy: boolean;
  onClose: () => void;
}) {
  useDialogBehavior(onClose, busy);
  return (
    <CreateProjectOverlay
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <CreateProjectPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        {children}
      </CreateProjectPanel>
    </CreateProjectOverlay>
  );
}
