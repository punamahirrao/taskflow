import { translate } from "../../../common/shared/i18n/translate";

export function timeAgo(isoDate: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60_000));
  if (minutes < 1) return translate("projectDetail.time.justNow");
  if (minutes < 60) return translate("projectDetail.time.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return translate("projectDetail.time.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  return translate(days === 1 ? "projectDetail.time.dayAgo" : "projectDetail.time.daysAgo", { count: days });
}
