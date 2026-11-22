import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastKind = "success" | "error" | "info" | "warning";
export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
  duration: number;
}
interface NotificationsState {
  toasts: Toast[];
}
const initialState: NotificationsState = { toasts: [] };
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    toastAdded(state, action: PayloadAction<Toast>) {
      state.toasts.push(action.payload);
    },
    toastRemoved(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    toastsCleared(state) {
      state.toasts = [];
    },
  },
});
export const notificationActions = notificationsSlice.actions;
export default notificationsSlice.reducer;
