import { createContext } from "react";
import type { LanguageCode, TranslationKey } from "../../../entities/language";
import type { LabelParams } from "../translate";

export interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, params?: LabelParams) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
