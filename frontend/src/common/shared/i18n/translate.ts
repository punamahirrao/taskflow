import type { LanguageCode, TranslationKey } from "../../entities/language";
import { en } from "./locales/en";
import { sv } from "./locales/sv";

export interface LabelParams {
  [name: string]: string | number;
}

export const LANGUAGE_STORAGE_KEY = "taskflow_language";

export function getStoredLanguage(): LanguageCode {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "sv" ? "sv" : "en";
}

/** Resolves a label for a language, replacing `{name}` placeholders with the supplied params. */
export function translateLabel(language: LanguageCode, key: TranslationKey, params?: LabelParams): string {
  const template = (language === "sv" ? sv[key] : undefined) ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => (name in params ? String(params[name]) : placeholder));
}

/** Non-React variant for api/hooks/utils code; uses the language saved in local storage. */
export function translate(key: TranslationKey, params?: LabelParams): string {
  return translateLabel(getStoredLanguage(), key, params);
}
