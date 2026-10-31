import { createContext } from "react";
import type { LanguageCode, TranslationKey } from "../../../entities/language";

export type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);
