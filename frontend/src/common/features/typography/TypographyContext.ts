import { createContext, useContext } from "react";
import type { TypographyPreferences } from "./localFonts";

interface TypographyState {
  preferences: TypographyPreferences;
  loading: boolean;
  error: string;
  save: (preferences: TypographyPreferences) => Promise<void>;
  reload: () => Promise<void>;
}
export const TypographyContext = createContext<TypographyState | null>(null);
export function useTypography() {
  const context = useContext(TypographyContext);
  if (!context) throw new Error("TypographyProvider is required.");
  return context;
}
