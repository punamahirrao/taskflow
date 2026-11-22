import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import notifications from "./notificationsSlice";
import theme from "./themeSlice";
import session from "./sessionSlice";
import projectSelection from "../../projects/store/projectSelectionSlice";
import { queryApi } from "../api/queryApi";

const rootReducer = combineReducers({
  notifications,
  theme,
  session,
  projectSelection,
  [queryApi.reducerPath]: queryApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (defaults) => defaults().concat(queryApi.middleware),
    preloadedState,
  });
}

export const store = createAppStore();
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
