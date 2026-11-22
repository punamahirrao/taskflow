import type { ProjectTab, ProjectTabItem } from "../entities/projectDetail";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

const tabs: ProjectTabItem[] = [
  { key: "overview", label: "projectDetail.tabs.overview" },
  { key: "tasks", label: "projectDetail.tabs.tasks" },
  { key: "timeline", label: "projectDetail.tabs.timeline" },
  { key: "files", label: "projectDetail.tabs.files" },
];

interface ProjectTabsProps {
  active: ProjectTab;
  onChange: (tab: ProjectTab) => void;
}

export function ProjectTabs({ active, onChange }: ProjectTabsProps) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("projectDetail.tabs.aria")}
      className="mt-2 flex gap-6 rounded-t-xl border-b border-gray-200 bg-white px-4"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`-mb-px border-b-2 py-3 text-sm font-medium ${active === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}
        >
          {t(tab.label)}
        </button>
      ))}
    </nav>
  );
}
