import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { ThemeName } from "../../../entities/theme";
import { ThemeContext } from "./themeContext";

const STORAGE_KEY = "taskflow_theme";
const VALID_THEMES: ThemeName[] = ["original", "professional", "night"];

function getInitialTheme(): ThemeName {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  // Keep users who had the previous theme selected on the equivalent renamed theme.
  const stored = storedTheme === "visual-studio" ? "professional" : storedTheme as ThemeName | null;
  return stored && VALID_THEMES.includes(stored) ? stored : "original";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setCurrentTheme] = useState<ThemeName>(getInitialTheme);
  const setTheme = useCallback((next: ThemeName) => {
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    setCurrentTheme(next);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
