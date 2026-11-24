import { Star } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function ProjectDefaultButton({
  name,
  isDefault,
  onToggle,
}: {
  name: string;
  isDefault: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDefault}
      aria-label={
        isDefault
          ? t("projects.card.removeDefaultAria", { name })
          : t("projects.card.setDefaultAria", { name })
      }
      title={isDefault ? t("projects.card.defaultTitle") : t("projects.card.setDefaultTitle")}
      className="absolute right-3 top-3 z-10 cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
      <Star
        size={18}
        aria-hidden="true"
        className={isDefault ? "fill-amber-400 text-amber-500" : ""}
      />
    </button>
  );
}
