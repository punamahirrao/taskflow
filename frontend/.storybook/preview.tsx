import type { Preview } from "@storybook/react-vite";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { ThemeProvider } from "../src/common/features/settings/context/ThemeProvider";
import { ProjectContext } from "../src/common/features/projects/context/ProjectContext";
import { LanguageProvider } from "../src/common/shared/i18n/context/LanguageProvider";
import { ToastViewport } from "../src/common/components/ToastViewport";
import notifications from "../src/common/store/notificationsSlice";
import projects from "../src/common/store/projectsSlice";
import themeReducer from "../src/common/store/themeSlice";
import session from "../src/common/store/sessionSlice";
import boards from "../src/common/store/boardsSlice";
import dashboard from "../src/common/store/dashboardSlice";
import { mockProjects } from "../src/mocks/projects";
import { handlers } from "../src/mocks/handlers";
import { FeatureFlagsProvider } from "./FeatureFlagsProvider";
import { mswLoader } from "msw-storybook-addon/csf3";
import "../src/common/common.css";
import "../src/boards/boards.css";
import "../src/backlog/backlog.css";
import "../src/dashboard/dashboard.css";
import "../src/calendar/calendar.css";

const styledTheme = {
  colors: { canvas: "var(--theme-canvas)", surface: "var(--theme-surface)", text: "var(--theme-text)", muted: "var(--theme-muted)", accent: "var(--theme-accent)", border: "var(--theme-border)" },
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Application theme",
      toolbar: { title: "Theme", icon: "paintbrush", items: [
        { value: "original", title: "Light" }, { value: "professional", title: "Professional" }, { value: "night", title: "Dark" },
      ], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "original" },
  loaders: [mswLoader()],
  parameters: {
    msw: { handlers },
    layout: "fullscreen",
    controls: { expanded: true, sort: "requiredFirst" },
    a11y: { test: "off" },
    docs: { toc: true },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? "original";
      document.documentElement.dataset.theme = theme;
      const appStore = configureStore({ reducer: { notifications, projects, theme: themeReducer, session, boards, dashboard }, preloadedState: { theme: { current: theme as "original" | "professional" | "night" } } });
      const projectValue = {
        projects: mockProjects, loading: false, error: "", reload: async () => undefined,
        selectedId: mockProjects[0]?.id ?? null, select: () => undefined, setDefault: async () => undefined,
      };
      return <Provider store={appStore}>
        <ThemeProvider>
          <StyledThemeProvider theme={styledTheme}>
            <LanguageProvider>
              <FeatureFlagsProvider flags={{ storybookMocks: true, advancedBoardWorkflow: true }}>
                <ProjectContext.Provider value={projectValue}>
                  <MemoryRouter initialEntries={["/"]}>
                    <div className="min-h-screen bg-canvas text-content"><Story /></div>
                    <ToastViewport />
                  </MemoryRouter>
                </ProjectContext.Provider>
              </FeatureFlagsProvider>
            </LanguageProvider>
          </StyledThemeProvider>
        </ThemeProvider>
      </Provider>;
    },
  ],
};

export default preview;
