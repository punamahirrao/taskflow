import { LayoutTemplate } from "lucide-react";
import { Link } from "react-router-dom";
import { settingsCategories, settingSlug } from "../../../settings/config/settingsCatalog";

export function PlanningTemplateList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {settingsCategories
        .find((category) => category.id === "templates")!
        .items.map((item) => (
          <Link
            key={item}
            to={`/settings/templates/${settingSlug(item)}`}
            className="rounded-xl border border-line bg-surface p-6 hover:border-accent"
          >
            <LayoutTemplate size={25} className="mb-4 text-accent" />
            <h2 className="text-sm font-semibold">{item}</h2>
            <p className="mt-2 text-xs text-muted">Explore configuration and availability →</p>
          </Link>
        ))}
    </div>
  );
}
