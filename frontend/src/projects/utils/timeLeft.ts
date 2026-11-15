import type { LanguageContextValue } from "../../common/shared/i18n/context/LanguageContext";
import type { ProjectTimeLeft } from "../entities/projects";

const DAY_MS = 24 * 60 * 60 * 1000;

export function timeLeft(endDate: string | null | undefined, t: LanguageContextValue["t"]): ProjectTimeLeft {
  if (!endDate) return { label: t("projects.card.noEndDate"), urgent: false };
  const [year, month, day] = endDate.split("-").map(Number);
  const today = new Date();
  const days = Math.round((new Date(year, month - 1, day).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / DAY_MS);
  if (days < 0) return { label: t(-days === 1 ? "projects.card.dayPastEnd" : "projects.card.daysPastEnd", { count: -days }), urgent: true };
  if (days === 0) return { label: t("projects.card.endsToday"), urgent: true };
  if (days < 7) return { label: t(days === 1 ? "projects.card.dayUntilEnd" : "projects.card.daysUntilEnd", { count: days }), urgent: true };
  const weeks = Math.round(days / 7);
  return { label: t(weeks === 1 ? "projects.card.weekLeft" : "projects.card.weeksLeft", { count: weeks }), urgent: false };
}
