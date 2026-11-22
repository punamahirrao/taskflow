import { useOrganization } from "../../organizations/context/OrganizationContext";
import { NAVIGATION_ITEMS } from "../features/navigation/navigationCatalog";
import { useNavigation } from "../features/navigation/NavigationContext";
import { Bell, Search, LockKeyhole, ArrowUpRight, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import UserMenu from "../features/profile/components/UserMenu";
import { useProjectDirectory } from "../features/projects/useProjectDirectory";
import { useTheme } from "../features/settings/hooks/useTheme";
import { useTranslation } from "../shared/i18n/hooks/useTranslation";
import {
  administrationSections,
  settingsCategories,
  settingSlug,
} from "../../settings/config/settingsCatalog";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { environment } = useOrganization();
  const { resolve } = useNavigation();
  const destinations = [
    ...NAVIGATION_ITEMS.filter((item) => item.section !== "planning-group").map((item) => [
      resolve(item).label,
      item.path,
    ]),
    ...settingsCategories.flatMap((category) => [
      [category.title, `/settings/${category.id}`],
      ...category.items.map((item) => [
        `${item} · ${category.title}`,
        `/settings/${category.id}/${settingSlug(item)}`,
      ]),
    ]),
    ...administrationSections.flatMap((section) =>
      section.items.map((item) => [
        `${item} · ${section.title}`,
        `/settings/administration/${section.id}/${settingSlug(item)}`,
      ]),
    ),
  ];
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const directory = useProjectDirectory(query, searchOpen && Boolean(query.trim()));
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.matches("input, textarea, select") || event.target.isContentEditable)
        )
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  const matches = destinations
    .filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  return (
    <header className="shell-topbar">
      <div
        ref={ref}
        className="global-search"
        onBlur={(event) => {
          if (!ref.current?.contains(event.relatedTarget)) setSearchOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setSearchOpen(false);
        }}
      >
        <label className="shell-search">
          <Search size={18} />
          <input
            ref={inputRef}
            type="search"
            aria-label="Search Taskflow"
            placeholder="Search projects, pages, settings…"
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
          />
          <kbd>/</kbd>
        </label>
        {searchOpen && query.trim() && (
          <div className="global-search-results">
            <p className="picker-caption">QUICK LINKS</p>
            {matches.map(([name, path]) => (
              <Link key={path} to={path} onClick={() => setSearchOpen(false)}>
                {name}
                <ArrowUpRight size={14} />
              </Link>
            ))}
            <p className="picker-caption">PROJECTS</p>
            {directory.loading && (
              <p role="status" className="picker-message">
                Searching…
              </p>
            )}
            {directory.error && (
              <p role="alert" className="picker-message">
                {directory.error}
              </p>
            )}
            {!directory.loading && !directory.error && !directory.projects.length && (
              <p className="picker-message">No matching projects.</p>
            )}
            {directory.projects.slice(0, 8).map((project) =>
              project.has_access ? (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  onClick={() => setSearchOpen(false)}
                >
                  {project.name}
                  <ArrowUpRight size={14} />
                </Link>
              ) : (
                <div className="restricted-search-result" key={project.id}>
                  <span>
                    {project.name}
                    <small>No access · contact an organization admin</small>
                  </span>
                  <LockKeyhole size={14} />
                </div>
              ),
            )}
            <Link
              to={`/projects?q=${encodeURIComponent(query)}`}
              onClick={() => setSearchOpen(false)}
            >
              View project directory
              <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </div>
      <div className="topbar-actions">
        {environment && ["preprod", "test"].includes(environment) && (
          <span className="data-environment-badge" title={`Connected to ${environment} data`}>
            {environment.toUpperCase()}
          </span>
        )}
        <button
          type="button"
          className="topbar-icon"
          aria-label={t(
            theme === "night" ? "sprintTrain.switchToLightTheme" : "sprintTrain.switchToNightTheme",
          )}
          onClick={() => setTheme(theme === "night" ? "professional" : "night")}
        >
          {theme === "night" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div
          className="notification-menu"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setNotificationsOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setNotificationsOpen(false);
          }}
        >
          <button
            type="button"
            className="topbar-icon"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={21} />
          </button>
          {notificationsOpen && (
            <section className="notification-popover" aria-label="Notifications">
              <h2>Notifications</h2>
              <Bell size={28} />
              <b>Notifications are not connected</b>
              <p>Recent work item activity is available on your dashboard.</p>
              <Link to="/dashboard" onClick={() => setNotificationsOpen(false)}>
                View activity →
              </Link>
            </section>
          )}
        </div>
        <span className="topbar-divider" />
        <UserMenu />
      </div>
    </header>
  );
}
