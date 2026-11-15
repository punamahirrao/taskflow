import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import notificationsReducer from "./notificationsSlice";
import projectsReducer from "./projectsSlice";
import themeReducer from "./themeSlice";
import sessionReducer from "./sessionSlice";
import boardsReducer from "./boardsSlice";
import dashboardReducer from "./dashboardSlice";

export const store = configureStore({ reducer: { notifications: notificationsReducer, projects: projectsReducer, theme: themeReducer, session: sessionReducer, boards: boardsReducer, dashboard: dashboardReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
