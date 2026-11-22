import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../src/common/features/settings/context/ThemeProvider";
import { ProjectContext } from "../src/common/features/projects/context/ProjectContext";
import { LanguageProvider } from "../src/common/shared/i18n/context/LanguageProvider";
import { ToastViewport } from "../src/common/components/ToastViewport";
import type { ThemeName } from "../src/common/entities/theme";
import { createAppStore } from "../src/common/store";
import { mockProjects } from "../src/mocks/projects";
import { mockUser } from "../src/mocks/users";
import { FeatureFlagsProvider } from "./FeatureFlagsProvider";

const projectValue = {
  projects: mockProjects,
  loading: false,
  error: "",
  reload: async () => undefined,
  selectedId: mockProjects[0]?.id ?? null,
  select: () => undefined,
  setDefault: async () => undefined,
};

export function StoryEnvironment({
  theme,
  route,
  anonymous,
  children,
}: {
  theme: ThemeName;
  route: string;
  anonymous: boolean;
  children: ReactNode;
}) {
  const [appStore] = useState(() =>
    createAppStore({
      theme: { current: theme },
      session: { user: anonymous ? null : mockUser, authenticated: !anonymous },
    }),
  );
  return (
    <Provider store={appStore}>
      <ThemeProvider>
        <LanguageProvider>
          <FeatureFlagsProvider flags={{ storybookMocks: true, advancedBoardWorkflow: true }}>
            <ProjectContext.Provider value={projectValue}>
              <MemoryRouter initialEntries={[route]}>
                <div className="min-h-screen bg-canvas text-content">{children}</div>
                <ToastViewport />
              </MemoryRouter>
            </ProjectContext.Provider>
          </FeatureFlagsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}
