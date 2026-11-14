export type ThemeName = "original" | "professional" | "night";

export type ThemeOption = {
  id: ThemeName;
  name: string;
  description: string;
  palette: string[];
};

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "original", name: "Original", description: "The current TaskFlow colors and contrast.", palette: ["#f7f7fb", "#ffffff", "#7c3aed", "#1e293b"] },
  { id: "professional", name: "Professional", description: "A polished light workspace with quiet slate surfaces and focused business blue accents.", palette: ["#f6f8fc", "#ffffff", "#2563eb", "#202939"] },
  { id: "night", name: "Night", description: "Deep navy canvas, cream navigation, indigo actions, and clear status colors.", palette: ["#090d16", "#121829", "#4f46e5", "#efece6", "#10b981", "#f59e0b"] },
];
