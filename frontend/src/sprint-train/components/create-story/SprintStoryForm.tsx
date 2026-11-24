import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";
import type { Sprint } from "../../../features/tasks/entities/task";

export function SprintStoryForm({
  children,
  sprint,
  onSubmit,
}: {
  children: ReactNode;
  sprint: Sprint;
  onSubmit: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3"
    >
      <p className="text-xs font-semibold">{t("sprintTrain.newStoryIn", { name: sprint.name })}</p>
      {children}
    </form>
  );
}
