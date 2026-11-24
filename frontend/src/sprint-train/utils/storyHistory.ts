import { translate } from "../../common/shared/i18n/translate";

export function formatHistoryValue(value: unknown): string {
  if (value === null) return translate("sprintTrain.none");
  if (Array.isArray(value)) return value.length ? value.join(", ") : translate("sprintTrain.none");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
