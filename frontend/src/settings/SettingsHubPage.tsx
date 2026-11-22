import BillingUsage from "./sections/BillingUsage";
import AuditLog from "./sections/AuditLog";
import { useState } from "react";
import {
  ChevronRight,
  Home,
  Search,
  Settings,
  Sprout,
  ArrowLeft,
  ArrowUpRight,
  Mountain,
} from "lucide-react";
import { Link, Navigate, NavLink, useParams } from "react-router-dom";
import { administrationSections, settingsCategories, settingSlug } from "./config/settingsCatalog";
import PersonalPreferences from "./sections/PersonalPreferences";
import AdministrationSettings from "./sections/AdministrationSettings";
import ProjectSettingsPanel from "./sections/ProjectSettingsPanel";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { SettingsHubStyles } from "./SettingsHub.styles";
import OrganizationSettings from "../organizations/sections/OrganizationSettings";
import { useOrganization } from "../organizations/context/OrganizationContext";
import ConfigureTaskflow from "./sections/ConfigureTaskflow";
import AdministrationSection from "./sections/AdministrationSection";
import FontSettings from "./sections/FontSettings";

export default function SettingsHubPage() {
  const { activeOrganization } = useOrganization();
  const { category: categoryId, setting, option } = useParams();
  const category = settingsCategories.find((item) => item.id === categoryId);
  const [query, setQuery] = useState("");
  const { selectedId } = useProjectContext();
  const selectedItem = category?.items.find((item) => settingSlug(item) === setting);
  const needle = query.trim().toLowerCase();
  const matches = settingsCategories.filter((item) =>
    `${item.title} ${item.items.join(" ")}`.toLowerCase().includes(needle),
  );
  const administrationSection =
    categoryId === "administration"
      ? administrationSections.find((item) => item.id === setting)
      : undefined;
  const selectedOption = administrationSection?.items.find((item) => settingSlug(item) === option);
  const configure = categoryId === "administration" && setting === "configure-taskflow";
  const typography = categoryId === "administration" && setting === "font-and-size";
  const target = (label: string) => {
    if (label === "Audit Logs") return "/settings/administration/audit-logs";
    if (label === "Billing & Subscription")
      return "/settings/administration/billing-and-subscription";
    if (label === "Configure Taskflow") return "/settings/administration/configure-taskflow";
    if (label === "Font & Size") return "/settings/administration/font-and-size";
    if (categoryId === "administration") return label === "Users" ? "/users" : null;
    if (categoryId === "users-teams" && label === "Teams") return "/settings/teams";
    if (categoryId === "personal" && ["Profile", "Security"].includes(label)) return "/profile";
    if (categoryId === "users-teams" && label === "Users") return "/users";
    if (label === "Reports") return "/reports";
    if (label === "Boards") return "/boards";
    if (label === "Sprints") return "/backlog";
    if (label === "Calendars") return "/calendar";
    if (
      categoryId === "work-management" &&
      ["Workflow Designer", "Statuses"].includes(label) &&
      selectedId
    )
      return `/project/${selectedId}/settings`;
    return null;
  };
  const showPreferences =
    categoryId === "personal" &&
    (!setting || ["preferences", "theme-light-dark", "language"].includes(setting));
  const categoryContent =
    categoryId === "organizations" ? (
      <OrganizationSettings />
    ) : typography ? (
      <FontSettings />
    ) : configure ? (
      <ConfigureTaskflow />
    ) : administrationSection?.id === "billing-and-subscription" ? (
      <BillingUsage />
    ) : administrationSection?.id === "audit-logs" ? (
      <AuditLog />
    ) : administrationSection ? (
      <AdministrationSection section={administrationSection} option={option} />
    ) : categoryId === "administration" ? (
      <AdministrationSettings />
    ) : categoryId === "project-settings" ? (
      <ProjectSettingsPanel />
    ) : categoryId === "teams" ? (
      <ProjectSettingsPanel teams />
    ) : null;
  if (categoryId === "billing" || categoryId === "audit-logs")
    return (
      <Navigate
        replace
        to={`/settings/administration/${categoryId === "billing" ? "billing-and-subscription" : "audit-logs"}${setting ? `/${setting}` : ""}`}
      />
    );
  return (
    <main className="settings-layout" data-testid="page-settings">
      <SettingsHubStyles />
      <aside className="settings-rail" aria-label="Settings navigation">
        <h1>
          <Settings size={24} />
          Settings
        </h1>
        <label className="shell-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search settings…"
            aria-label="Search settings"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <nav>
          <NavLink
            end
            to="/settings"
            className={({ isActive }) => (isActive && !query ? "active" : "")}
          >
            <Home size={18} />
            Overview
          </NavLink>
          {matches.map(({ id, title, icon: Icon }) => (
            <NavLink
              key={id}
              to={`/settings/${id}`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} />
              {title}
            </NavLink>
          ))}
        </nav>
        <div className="settings-rail-note">
          <span className="settings-note-dot" />
          {activeOrganization?.name}
        </div>
      </aside>
      <div className="settings-main">
        <div className="settings-breadcrumb">
          <Link to="/settings">Settings</Link>
          {category && (
            <>
              <ChevronRight size={12} />
              <Link to={`/settings/${category.id}`}>{category.title}</Link>
            </>
          )}
          {selectedItem && (
            <>
              <ChevronRight size={12} />
              <span>{selectedItem}</span>
            </>
          )}
          {selectedOption && (
            <>
              <ChevronRight size={12} />
              <span>{selectedOption}</span>
            </>
          )}
        </div>
        <header className="settings-heading">
          <div>
            <p className="settings-eyebrow">YOUR ORGANIZATION, YOUR WAY</p>
            <h2>
              {categoryId === "administration" && selectedItem
                ? selectedItem
                : (category?.title ?? (categoryId ? "Setting not found" : "Settings"))}
            </h2>
            <p>
              {typography
                ? "Choose a local font and text size for Taskflow."
                : configure
                  ? "Personalize the names and icons in your left-hand menu."
                  : (administrationSection?.description ??
                    category?.description ??
                    "Manage your organization, teams and preferences, all in one place.")}
            </p>
          </div>
          <div className="settings-banner">
            <span>
              Configure today.
              <br />
              <b>Build a better tomorrow.</b>
            </span>
            <Mountain size={70} strokeWidth={1} />
          </div>
        </header>
        {categoryId && !category ? (
          <section className="settings-panel">
            <p>This settings category does not exist.</p>
            <Link to="/settings">Return to overview</Link>
          </section>
        ) : !category ? (
          <section className="settings-panel">
            <div className="settings-section-heading">
              <h3>Settings categories</h3>
              <span>{matches.length} categories</span>
            </div>
            <div className="settings-card-grid">
              {matches.map(({ id, title, description, icon: Icon, color, items }) => (
                <Link className="settings-category-card" key={id} to={`/settings/${id}`}>
                  <span className={`settings-category-icon ${color}`}>
                    <Icon size={24} />
                  </span>
                  <span>
                    <h4>{title}</h4>
                    <p>{description}</p>
                    {needle && (
                      <small>
                        {items.filter((item) => item.toLowerCase().includes(needle)).join(" · ")}
                      </small>
                    )}
                  </span>
                  <ChevronRight size={18} />
                </Link>
              ))}
            </div>
            {!matches.length && (
              <p className="settings-empty">No settings match “{query}”. Try another search.</p>
            )}
            <div className="settings-footer-banner">
              <Sprout size={35} />
              <span>
                <b>Tailor your organization to fit the way your team works.</b>
                <p>
                  From agile sprints to project plans, find the settings that help your team move
                  forward.
                </p>
              </span>
            </div>
          </section>
        ) : (
          (categoryContent ?? (
            <>
              <Link to="/settings" className="settings-back">
                <ArrowLeft size={14} />
                All settings
              </Link>
              {categoryId === "templates" && (
                <section className="settings-panel">
                  <Link className="settings-action" to="/templates">
                    Open templates library <ArrowUpRight size={15} />
                  </Link>
                </section>
              )}
              <section className="settings-panel">
                <div className="settings-section-heading">
                  <h3>{selectedItem ?? "Explore settings"}</h3>
                  <span>{category.items.length} options</span>
                </div>
                <div className="settings-options">
                  {category.items
                    .filter(
                      (item) =>
                        !needle ||
                        category.title.toLowerCase().includes(needle) ||
                        item.toLowerCase().includes(needle),
                    )
                    .map((item) => (
                      <Link
                        key={item}
                        className={item === selectedItem ? "selected" : ""}
                        to={target(item) ?? `/settings/${category.id}/${settingSlug(item)}`}
                      >
                        <span>
                          {item}
                          {!target(item) &&
                            !["personal", "work-management"].includes(category.id) && (
                              <small className="ml-2 text-muted">Planned</small>
                            )}
                        </span>
                        {target(item) ? <ArrowUpRight size={16} /> : <ChevronRight size={16} />}
                      </Link>
                    ))}
                </div>
              </section>
              {showPreferences && (
                <div className="settings-preferences">
                  <PersonalPreferences />
                </div>
              )}
              {setting && !selectedItem && (
                <section className="settings-panel">
                  <h3>Setting not found</h3>
                  <p>Choose an option above to continue.</p>
                </section>
              )}
              {selectedItem && !showPreferences && (
                <section className="settings-panel setting-detail">
                  <span className={`settings-category-icon ${category.color}`}>
                    <category.icon size={25} />
                  </span>
                  <h3>{selectedItem}</h3>
                  {target(selectedItem) ? (
                    <Link className="settings-action" to={target(selectedItem)!}>
                      Open {selectedItem.toLowerCase()}
                      <ArrowUpRight size={15} />
                    </Link>
                  ) : (
                    <>
                      <span className="settings-status">Planned feature</span>
                      <p>
                        {category.id === "integrations"
                          ? `Connect ${selectedItem} to bring your tools into Taskflow. This integration is not connected yet.`
                          : `${selectedItem} is available in the settings directory. Configuration controls for this area are not available yet.`}
                      </p>
                      {category.id === "work-management" && !selectedId && (
                        <Link to="/projects">Select a project to manage its workflow →</Link>
                      )}
                    </>
                  )}
                </section>
              )}
            </>
          ))
        )}
      </div>
    </main>
  );
}
