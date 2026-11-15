import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ThemeName } from "../entities/theme";

const KEY = "taskflow_theme";
const valid: ThemeName[] = ["original", "professional", "night"];
function storedTheme(): ThemeName {
  try { const value = localStorage.getItem(KEY); const migrated = value === "visual-studio" ? "professional" : value; return valid.includes(migrated as ThemeName) ? migrated as ThemeName : "original"; }
  catch { return "original"; }
}
const themeSlice = createSlice({ name: "theme", initialState: { current: storedTheme() }, reducers: { themeChanged(state, action: PayloadAction<ThemeName>) { state.current = action.payload; try { localStorage.setItem(KEY, action.payload); } catch { /* theme remains active for this page */ } } } });
export const themeActions = themeSlice.actions;
export default themeSlice.reducer;
