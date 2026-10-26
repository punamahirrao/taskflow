export type ProjectTab = "overview" | "tasks" | "timeline" | "files";
const tabs: { key: ProjectTab; label: string }[] = [
  { key: "overview", label: "Overview" }, { key: "tasks", label: "Tasks" },
  { key: "timeline", label: "Timeline" }, { key: "files", label: "Files" },
];

export function ProjectTabs({ active, onChange }: { active: ProjectTab; onChange: (tab: ProjectTab) => void }) {
  return <nav aria-label="Project sections" className="mt-2 flex gap-6 rounded-t-xl border-b border-gray-200 bg-white px-4">
    {tabs.map((tab) => <button key={tab.key} type="button" onClick={() => onChange(tab.key)} className={`-mb-px border-b-2 py-3 text-sm font-medium ${active === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>{tab.label}</button>)}
  </nav>;
}
