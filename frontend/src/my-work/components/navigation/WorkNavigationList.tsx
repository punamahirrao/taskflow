import {
  AtSign,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  FileText,
  FolderKanban,
  LayoutGrid,
  ListTodo,
} from "lucide-react";
import type { WorkTab } from "../../entities/work";
import { WorkNavigationLink } from "./WorkNavigationLink";

const tabs = [
  { id: "overview", label: "Overview", Icon: LayoutGrid },
  { id: "tasks", label: "My Tasks", Icon: ListTodo },
  { id: "approvals", label: "My Approvals", Icon: ClipboardCheck },
  { id: "calendar", label: "My Calendar", Icon: CalendarDays },
  { id: "time", label: "My Time", Icon: Clock3 },
  { id: "projects", label: "My Projects", Icon: FolderKanban },
  { id: "mentions", label: "Mentions", Icon: AtSign },
  { id: "documents", label: "My Documents", Icon: FileText },
] as const;
export function WorkNavigationList({ activeTab }: { activeTab: WorkTab }) {
  return (
    <nav className="my-work-nav" aria-label="My Work views">
      {tabs.map(({ id, label, Icon }) => (
        <WorkNavigationLink key={id} id={id} label={label} Icon={Icon} active={activeTab === id} />
      ))}
    </nav>
  );
}
