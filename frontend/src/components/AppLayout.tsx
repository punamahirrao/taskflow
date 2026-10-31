import { Search } from "lucide-react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ProjectProvider } from "../features/projects/context/ProjectProvider";
import UserMenu from "../features/profile/components/UserMenu";
import ProjectSidebar from "../sections/projects/ProjectSidebar";
import type { TranslationKey } from "../entities/language";
import { useTranslation } from "../shared/i18n/hooks/useTranslation";

const TITLES: [string, TranslationKey][] = [
  ["/dashboard", "app.dashboard"], ["/projects", "app.projects"], ["/backlog", "app.backlog"],
  ["/boards", "app.boards"], ["/portfolio", "app.portfolio"], ["/documents", "app.documents"],
  ["/settings", "app.settings"], ["/project/", "app.project"], ["/profile", "app.profile"],
  ["/team", "app.team"], ["/calendar", "app.calendar"], ["/reports", "app.reports"], ["/users", "app.users"],
];

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const titleKey = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1];
  const title = titleKey ? t(titleKey) : t("app.taskflow");
  const query = pathname === "/projects" ? params.get("q") ?? "" : "";

  function handleSearch(value: string) {
    navigate(value ? `/projects?q=${encodeURIComponent(value)}` : "/projects", { replace: pathname === "/projects" });
  }

  return <ProjectProvider><div className="min-h-screen bg-gray-100 md:grid md:grid-cols-[250px_minmax(0,1fr)]">
    <ProjectSidebar />
    <div className="min-w-0">
      <header data-testid="app-header" className="sticky top-0 z-20 grid h-16 grid-cols-[1fr_auto] items-center gap-3 border-b border-gray-200 bg-gray-50 px-6 sm:grid-cols-[1fr_minmax(0,24rem)_1fr]">
        <h1 className="truncate text-xl font-semibold text-purple-700">{title}</h1>
        {pathname === "/projects" ? <label className="relative order-last col-span-2 sm:order-none sm:col-span-1"><span className="sr-only">{t("nav.searchProjects")}</span>
          <input aria-label={t("nav.searchProjects")} type="search" placeholder={t("nav.searchProjects")} value={query} onChange={(event) => handleSearch(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" /></label> : <div />}
        <div className="flex justify-end"><UserMenu /></div>
      </header>
      <Outlet />
    </div>
  </div></ProjectProvider>;
}
