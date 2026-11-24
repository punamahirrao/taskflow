import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { MessageSquare, History } from "lucide-react";
import type { TranslationKey } from "../../../common/entities/language";
import type { DrawerTab } from "../../entities/storyDetails";

const tabLabelKeys: Record<DrawerTab, TranslationKey> = {
  details: "sprintTrain.tabDetails",
  comments: "sprintTrain.tabComments",
  history: "sprintTrain.tabHistory",
};

export function StoryDetailsTabs({
  activeTab,
  commentCount,
  onTab,
}: {
  activeTab: DrawerTab;
  commentCount: number;
  onTab: (tab: DrawerTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("sprintTrain.detailsSections")}
      className="flex shrink-0 gap-1 border-b border-slate-200 px-5 pt-2"
    >
      {(["details", "comments", "history"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTab(tab)}
          aria-current={activeTab === tab ? "page" : undefined}
          className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold capitalize ${activeTab === tab ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          {tab === "comments" ? (
            <MessageSquare size={14} />
          ) : tab === "history" ? (
            <History size={14} />
          ) : null}
          {t(tabLabelKeys[tab])}
          {tab === "comments" && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[calc(10px*var(--taskflow-font-scale,1))]">
              {commentCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
