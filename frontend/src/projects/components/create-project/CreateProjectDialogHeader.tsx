import { X } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import {
  CreateProjectHeader,
  CreateProjectTitle,
  CreateProjectCloseButton,
} from "../../Projects.styles";

export function CreateProjectDialogHeader({
  submitting,
  onClose,
}: {
  submitting: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <CreateProjectHeader>
      <CreateProjectTitle id="create-project-title">
        {t("projects.dialog.title")}
      </CreateProjectTitle>
      <CreateProjectCloseButton
        type="button"
        onClick={onClose}
        disabled={submitting}
        aria-label={t("projects.dialog.closeDialog")}
      >
        <X size={20} />
      </CreateProjectCloseButton>
    </CreateProjectHeader>
  );
}
