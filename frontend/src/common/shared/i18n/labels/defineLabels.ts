import type { LabelSet } from "../../../entities/language";

/** Declares one page's labels. `sv` only needs the keys that have a Swedish translation; the rest fall back to English. */
export function defineLabels<K extends string>(
  en: Record<K, string>,
  sv: Partial<Record<NoInfer<K>, string>> = {},
): LabelSet<K> {
  return { en, sv };
}
