import type { TranslationKey } from "../../entities/language";
import { useTranslation } from "../../shared/i18n/hooks/useTranslation";
import TaskflowLogo from "../../components/TaskflowLogo";

const benefits: TranslationKey[] = [
  "auth.benefitProjects",
  "auth.benefitRoles",
  "auth.benefitDashboard",
  "auth.benefitSecure",
];
const stats: [string, TranslationKey][] = [
  ["10x", "auth.statClearerPlanning"],
  ["4", "auth.statAccessRoles"],
  ["24/7", "auth.statTeamVisibility"],
];

export function AuthPromoSection() {
  const { t } = useTranslation();
  return (
    <section
      className="hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex"
      style={{ backgroundColor: "#122235", color: "#f8fafc" }}
    >
      <TaskflowLogo inverse />
      <div className="max-w-lg">
        <h2 className="text-4xl font-bold leading-tight">{t("auth.promoHeadline")}</h2>
        <p className="mt-4 text-lg text-indigo-100">{t("auth.promoDescription")}</p>
        <ul className="mt-8 space-y-4 text-indigo-50">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3">
              <span aria-hidden="true" className="text-green-300">
                ✔
              </span>
              <span>{t(benefit)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {stats.map(([value, label]) => (
            <div key={value} className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-indigo-100">{t(label)}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-indigo-200">{t("auth.promoFooter")}</p>
    </section>
  );
}
