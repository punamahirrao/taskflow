import { useOrganization } from "../../organizations/context/OrganizationContext";
import { ChevronRight, Settings2, Type, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { administrationSections } from "../config/settingsCatalog";

const cards = [
  {
    title: "Users",
    description: "Manage user accounts, organization access and account details.",
    to: "/users",
    icon: UsersRound,
    color: "green",
  },
  ...administrationSections.map((section) => ({
    ...section,
    to: `/settings/administration/${section.id}`,
  })),
  {
    title: "Configure Taskflow",
    description: "Personal preference: names, icons and colors for your menu.",
    to: "/settings/administration/configure-taskflow",
    icon: Settings2,
    color: "violet",
  },
  {
    title: "Font & Size",
    description: "Personal preference: local font and text size for this organization.",
    to: "/settings/administration/font-and-size",
    icon: Type,
    color: "blue",
  },
];

export default function AdministrationSettings() {
  const { activeOrganization } = useOrganization();
  const canManage = activeOrganization?.role === "owner" || activeOrganization?.role === "admin";
  const visibleCards = cards.filter(
    (card) =>
      canManage ||
      ![
        "/users",
        "/settings/administration/audit-logs",
        "/settings/administration/billing-and-subscription",
      ].includes(card.to),
  );
  return (
    <section className="settings-panel" aria-label="Administration options">
      <div className="settings-section-heading">
        <h3>Administration options</h3>
        <span>{visibleCards.length} options</span>
      </div>
      <div className="settings-card-grid">
        {visibleCards.map(({ title, description, to, icon: Icon, color }) => (
          <Link key={to} className="settings-category-card" to={to}>
            <span className={`settings-category-icon ${color}`}>
              <Icon size={24} />
            </span>
            <span>
              <h4>{title}</h4>
              <p>{description}</p>
            </span>
            <ChevronRight size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
