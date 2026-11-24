import { Check, CircleHelp, Layers3, CalendarClock, Sparkles } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { BacklogMetric } from "./BacklogMetric";

const presentation = {
  pipeline: { label: "backlog.metricIdeasInPipeline", Icon: Layers3, tint: "violet" },
  ready: { label: "backlog.metricReadyForSprint", Icon: Check, tint: "green" },
  estimate: { label: "backlog.metricNeedsEstimate", Icon: CircleHelp, tint: "amber" },
  blocked: { label: "backlog.metricBlocked", Icon: Sparkles, tint: "rose" },
  stale: { label: "backlog.metricStale", Icon: CalendarClock, tint: "amber" },
} as const;
export type BacklogHealthKind = keyof typeof presentation;

export function BacklogHealthCard({ kind, value }: { kind: BacklogHealthKind; value: number }) {
  const { t } = useTranslation();
  const { label, Icon, tint } = presentation[kind];
  return <BacklogMetric label={t(label)} value={value} icon={<Icon size={16} />} tint={tint} />;
}
