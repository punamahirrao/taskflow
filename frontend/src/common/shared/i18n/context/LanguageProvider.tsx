import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { LanguageCode, TranslationKey } from "../../../entities/language";
import { getStoredLanguage, LANGUAGE_STORAGE_KEY, translateLabel, type LabelParams } from "../translate";
import { LanguageContext } from "./LanguageContext";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setCurrentLanguage] = useState<LanguageCode>(getStoredLanguage);
  const setLanguage = useCallback((next: LanguageCode) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    document.documentElement.lang = next;
    setCurrentLanguage(next);
  }, []);
  const t = useCallback((key: TranslationKey, params?: LabelParams) => translateLabel(language, key, params), [language]);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
