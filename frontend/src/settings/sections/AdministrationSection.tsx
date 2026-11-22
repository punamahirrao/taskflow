import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { settingSlug, type SettingsCategory } from "../config/settingsCatalog";

export default function AdministrationSection({
  section,
  option,
}: {
  section: SettingsCategory;
  option?: string;
}) {
  const selected = section.items.find((item) => settingSlug(item) === option);
  const Icon = section.icon;
  return (
    <>
      <section className="settings-panel">
        <div className="settings-section-heading">
          <h3>{section.title}</h3>
          <span>{section.items.length} options</span>
        </div>
        <div className="settings-options">
          {section.items.map((item) => (
            <Link
              key={item}
              className={item === selected ? "selected" : ""}
              to={`/settings/administration/${section.id}/${settingSlug(item)}`}
            >
              <span>{item}</span>
              <ChevronRight size={16} />
            </Link>
          ))}
        </div>
      </section>
      {selected && (
        <section className="settings-panel setting-detail">
          <span className={`settings-category-icon ${section.color}`}>
            <Icon size={25} />
          </span>
          <h3>{selected}</h3>
          <span className="settings-status">Not configured</span>
          <p>{selected} configuration controls are not available yet.</p>
        </section>
      )}
      {option && !selected && (
        <section className="settings-panel">
          <h3>Setting not found</h3>
          <p>Choose an option above to continue.</p>
        </section>
      )}
    </>
  );
}
