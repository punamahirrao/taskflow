import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function ProjectCreateButton({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button type="button" className="project-create-button" onClick={onCreate} disabled={disabled}>
      {t("projects.create")}
    </button>
  );
}
