import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { LanguageCode } from "../../../entities/language";
import { en } from "../locales/en";
import { sv } from "../locales/sv";
import { LanguageContext } from "./LanguageContext";

const STORAGE_KEY = "taskflow_language";
const TRANSLATIONS = { en, sv };

function getInitialLanguage(): LanguageCode {
  return localStorage.getItem(STORAGE_KEY) === "sv" ? "sv" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<LanguageCode>(getInitialLanguage);
  const setLanguage = useCallback((next: LanguageCode) => {
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    setCurrentLanguage(next);
  }, []);
  const t = useCallback((key: keyof typeof en) => TRANSLATIONS[language][key], [language]);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
