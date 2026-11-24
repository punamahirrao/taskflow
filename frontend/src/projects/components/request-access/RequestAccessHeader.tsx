import { X } from "lucide-react";
import {
  CreateProjectHeader,
  CreateProjectTitle,
  CreateProjectCloseButton,
} from "../../Projects.styles";

export function RequestAccessHeader({ busy, onClose }: { busy: boolean; onClose: () => void }) {
  return (
    <CreateProjectHeader>
      <CreateProjectTitle id="request-access-title">Request project access</CreateProjectTitle>
      <CreateProjectCloseButton
        type="button"
        onClick={onClose}
        disabled={busy}
        aria-label="Close access request"
      >
        <X size={20} />
      </CreateProjectCloseButton>
    </CreateProjectHeader>
  );
}
