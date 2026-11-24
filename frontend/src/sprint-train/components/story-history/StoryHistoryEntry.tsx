import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { TaskHistoryEntry } from "../../../features/tasks/entities/taskActivity";
import { StoryHistoryChanges } from "./StoryHistoryChanges";

export function StoryHistoryEntry({ entry }: { entry: TaskHistoryEntry }) {
  const { t } = useTranslation();
  return (
    <li className="relative">
      <span className="absolute -left-[26px] top-1 grid size-3 place-items-center rounded-full border-2 border-indigo-400 bg-white" />
      <p className="text-xs font-semibold capitalize text-slate-800">
        {entry.action.replaceAll("_", " ")}{" "}
        <span className="font-normal text-slate-500">
          {t("sprintTrain.historyBy", { name: entry.actor_name })}
        </span>
      </p>
      <time className="text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-400">
        {new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(entry.created_at))}
      </time>
      {Object.entries(entry.changes).length > 0 && <StoryHistoryChanges changes={entry.changes} />}
    </li>
  );
}
