import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../entities/user";

type SessionUser = Partial<User>;
function readUser(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
function hasStoredTokens() {
  try {
    return Boolean(
      sessionStorage.getItem("access_token") || sessionStorage.getItem("refresh_token"),
    );
  } catch {
    return false;
  }
}
const sessionSlice = createSlice({
  name: "session",
  initialState: { user: readUser(), authenticated: hasStoredTokens() },
  reducers: {
    userChanged(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
      state.authenticated = Boolean(action.payload);
    },
    authenticationChanged(state, action: PayloadAction<boolean>) {
      state.authenticated = action.payload;
      if (!action.payload) state.user = null;
    },
  },
});
export const sessionActions = sessionSlice.actions;
export default sessionSlice.reducer;
