import { useEffect, type ReactNode } from "react";
import type { ThemeName } from "../../../entities/theme";
import { useAppDispatch, useAppSelector } from "../../../store";
import { themeActions } from "../../../store/themeSlice";
import { ThemeContext } from "./themeContext";
import { AppStyles } from "../../../App.styles";

interface ThemeProviderProps {
  children: ReactNode;
}
export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.current);
  const setTheme = (next: ThemeName) => dispatch(themeActions.themeChanged(next));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AppStyles />
      {children}
    </ThemeContext.Provider>
  );
}
