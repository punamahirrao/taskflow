import { createContext } from "react";
import type { ThemeContextValue } from "../../../entities/theme";

export type { ThemeContextValue };
export const ThemeContext = createContext<ThemeContextValue | null>(null);
