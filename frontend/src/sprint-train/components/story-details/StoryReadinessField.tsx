import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { ReadyCheck } from "../../entities/sprintTrain";
import { CheckCircle2, Circle } from "lucide-react";

export function StoryReadinessField({ readyChecks }: { readyChecks: ReadyCheck[] }) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.definitionOfReady")}>
      <ul className="space-y-2">
        {readyChecks.map((check) => (
          <li key={check.labelKey} className="flex items-center gap-2">
            {check.ready ? (
              <CheckCircle2 size={15} className="text-emerald-600" />
            ) : (
              <Circle size={15} className="text-slate-300" />
            )}
            {t(check.labelKey)}
          </li>
        ))}
      </ul>
    </Detail>
  );
}
