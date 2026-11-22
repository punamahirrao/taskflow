export type ThemeName = "original" | "professional" | "night";

export interface ThemeOption {
  id: ThemeName;
  name: string;
  description: string;
  palette: string[];
}

export interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

/** Theme swatches mirror the semantic CSS variables in common/common.css. */
export const THEME_PALETTES: Record<ThemeName, string[]> = {
  original: ["#f7f7fb", "#ffffff", "#7c3aed", "#1e293b"],
  professional: ["#f6f8fc", "#ffffff", "#2563eb", "#202939"],
  night: ["#090d16", "#121829", "#4f46e5", "#122235", "#10b981", "#f59e0b"],
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "original",
    name: "Original",
    description: "The current TaskFlow colors and contrast.",
    palette: THEME_PALETTES.original,
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "A polished light interface with quiet slate surfaces and focused business blue accents.",
    palette: THEME_PALETTES.professional,
  },
  {
    id: "night",
    name: "Night",
    description: "Deep navy canvas, dark navigation, indigo actions, and clear status colors.",
    palette: THEME_PALETTES.night,
  },
];
