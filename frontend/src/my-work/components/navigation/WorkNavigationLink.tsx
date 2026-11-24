import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { WorkTab } from "../../entities/work";
export function WorkNavigationLink({
  id,
  label,
  Icon,
  active,
}: {
  id: WorkTab;
  label: string;
  Icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      to={id === "overview" ? "/my-work" : `/my-work?view=${id}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}
