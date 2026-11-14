import type { en } from "../shared/i18n/locales/en";

export type LanguageCode = "en" | "sv";

export type TranslationKey = keyof typeof en;

export interface LabelSet<K extends string> {
  en: Record<K, string>;
  sv: Partial<Record<K, string>>;
}
