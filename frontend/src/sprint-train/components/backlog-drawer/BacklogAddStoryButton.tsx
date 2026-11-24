import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Plus, X } from "lucide-react";
import type { BacklogDrawerProps } from "../../entities/backlogDrawer";

export function BacklogAddStoryButton({
  selectedSprint,
  createStoryOpen,
  onToggleCreateStory,
}: Pick<BacklogDrawerProps, "selectedSprint" | "createStoryOpen" | "onToggleCreateStory">) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      disabled={!selectedSprint}
      onClick={onToggleCreateStory}
      aria-expanded={createStoryOpen}
      title={
        selectedSprint
          ? t("sprintTrain.createStoryIn", { name: selectedSprint.name })
          : t("sprintTrain.selectSprintToCreateStory")
      }
      className="sprint-backlog-add-story"
    >
      {createStoryOpen ? <X size={15} /> : <Plus size={15} />}{" "}
      {createStoryOpen ? t("common.cancel") : t("sprintTrain.addStory")}
    </button>
  );
}
