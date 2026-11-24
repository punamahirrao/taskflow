import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintStorySubmitButton({
  saving,
  hasTitle,
}: {
  saving: boolean;
  hasTitle: boolean;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={saving || !hasTitle}
      className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {saving ? t("sprintTrain.savingStory") : t("sprintTrain.addStoryToSprint")}
    </button>
  );
}
