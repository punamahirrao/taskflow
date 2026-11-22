import { lazy, Suspense } from "react";

import { AppErrorBoundary } from "./common/components/AppErrorBoundary";

const NotFoundPage = lazy(() => import("./common/components/NotFoundPage"));

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./common/components/AppLayout";

import ProtectedRoute from "./common/components/ProtectedRoute";

const PlanningPage = lazy(() => import("./planning/PlanningPage"));
const ReleasePage = lazy(() => import("./releases/ReleasePage"));
const DependenciesPage = lazy(() => import("./planning/DependenciesPage"));
const DashboardPage = lazy(() => import("./dashboard/DashboardPage"));

const LoginPage = lazy(() => import("./login/LoginPage"));

const ProjectDetailPage = lazy(() => import("./project-detail/ProjectDetailPage"));

const ProjectsPage = lazy(() => import("./projects/ProjectsPage"));

const ProfilePage = lazy(() => import("./profile/ProfilePage"));

const CalendarPage = lazy(() => import("./calendar/CalendarPage"));

const ReportsPage = lazy(() => import("./reports/ReportsPage"));

const RegisterPage = lazy(() => import("./register/RegisterPage"));

const ShareProjectPage = lazy(() => import("./share-project/ShareProjectPage"));

const UsersPage = lazy(() => import("./users/UsersPage"));

const BacklogPage = lazy(() => import("./backlog/BacklogPage"));

const BoardsPage = lazy(() => import("./boards/BoardsPage"));

const BoardsDirectoryPage = lazy(() => import("./boards/BoardsDirectoryPage"));

const SettingsHubPage = lazy(() => import("./settings/SettingsHubPage"));

const DocumentsPage = lazy(() => import("./documents/DocumentsPage"));

const OrganizationSectionPage = lazy(() => import("./common/components/OrganizationSectionPage"));

const MyWorkPage = lazy(() => import("./my-work/MyWorkPage"));

const RoadmapPage = lazy(() => import("./roadmap/RoadmapPage"));

const SprintTrainPage = lazy(() => import("./sprint-train/SprintTrainPage"));

const AiEstimatorPage = lazy(() => import("./ai-estimator/AiEstimatorPage"));

const ProjectSettingsPage = lazy(() => import("./project-detail/ProjectSettingsPage"));

import { ThemeProvider } from "./common/features/settings/context/ThemeProvider";

import { LanguageProvider } from "./common/shared/i18n/context/LanguageProvider";

import { ToastViewport } from "./common/components/ToastViewport";

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <ThemeProvider>
            <Suspense
              fallback={
                <div role="status" className="p-8">
                  Loading page…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/register" element={<RegisterPage />} />

                <Route path="/login" element={<LoginPage />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route path="/projects" element={<ProjectsPage />} />

                  <Route path="/backlog" element={<BacklogPage />} />

                  <Route path="/sprint-train" element={<SprintTrainPage />} />

                  <Route path="/boards" element={<BoardsDirectoryPage />} />

                  <Route path="/boards/:boardId" element={<BoardsPage />} />

                  <Route path="/ai-estimator" element={<AiEstimatorPage />} />

                  <Route path="/settings/:category?/:setting?" element={<SettingsHubPage />} />

                  <Route
                    path="/settings/:category/:setting/:option"
                    element={<SettingsHubPage />}
                  />

                  <Route path="/my-work" element={<MyWorkPage />} />

                  <Route path="/documents" element={<DocumentsPage />} />

                  <Route path="/releases" element={<ReleasePage />} />

                  <Route path="/goals" element={<PlanningPage kind="goal" />} />

                  <Route path="/templates" element={<PlanningPage kind="template" />} />

                  <Route path="/planning/roadmap" element={<RoadmapPage />} />

                  <Route path="/planning/milestones" element={<PlanningPage kind="milestone" />} />
                  <Route path="/planning/dependencies" element={<DependenciesPage />} />
                  <Route path="/planning/charts" element={<Navigate to="/reports" replace />} />
                  <Route path="/planning/:section" element={<OrganizationSectionPage />} />

                  <Route path="/profile" element={<ProfilePage />} />

                  <Route path="/calendar" element={<CalendarPage />} />

                  <Route path="/reports" element={<ReportsPage />} />

                  <Route path="/users" element={<UsersPage />} />

                  <Route path="/project/:id" element={<ProjectDetailPage />} />

                  <Route path="/project/:id/settings" element={<ProjectSettingsPage />} />

                  <Route path="/project/:id/share" element={<ShareProjectPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>

            <ToastViewport />
          </ThemeProvider>
        </LanguageProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
