import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import {
  CreateProjectActions,
  CreateProjectCancelButton,
  CreateProjectSubmitButton,
} from "../../Projects.styles";

export function CreateProjectFormActions({
  submitting,
  onCancel,
}: {
  submitting: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <CreateProjectActions>
      <CreateProjectCancelButton type="button" onClick={onCancel} disabled={submitting}>
        {t("projects.dialog.cancel")}
      </CreateProjectCancelButton>
      <CreateProjectSubmitButton type="submit" disabled={submitting}>
        {submitting ? t("projects.dialog.creating") : t("projects.dialog.submit")}
      </CreateProjectSubmitButton>
    </CreateProjectActions>
  );
}
