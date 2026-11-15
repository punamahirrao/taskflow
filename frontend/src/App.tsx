import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./common/components/AppLayout";
import ProtectedRoute from "./common/components/ProtectedRoute";
import DashboardPage from "./dashboard/DashboardPage";
import LoginPage from "./login/LoginPage";
import ProjectDetailPage from "./project-detail/ProjectDetailPage";
import ProjectsPage from "./projects/ProjectsPage";
import ProfilePage from "./profile/ProfilePage";
import CalendarPage from "./calendar/CalendarPage";
import ReportsPage from "./reports/ReportsPage";
import RegisterPage from "./register/RegisterPage";
import ShareProjectPage from "./share-project/ShareProjectPage";
import UsersPage from "./users/UsersPage";
import BacklogPage from "./backlog/BacklogPage";
import BoardsPage from "./boards/BoardsPage";
import BoardDashboardPage from "./boards/BoardDashboardPage";
import PortfolioPage from "./portfolio/PortfolioPage";
import SettingsPage from "./settings/SettingsPage";
import SprintTrainPage from "./sprint-train/SprintTrainPage";
import AiEstimatorPage from "./ai-estimator/AiEstimatorPage";
import ProjectSettingsPage from "./project-detail/ProjectSettingsPage";
import { ThemeProvider } from "./common/features/settings/context/ThemeProvider";
import { LanguageProvider } from "./common/shared/i18n/context/LanguageProvider";
import { AutomaticTestIds } from "./common/shared/components/AutomaticTestIds";
import { ToastViewport } from "./common/components/ToastViewport";

function App() {
  return <BrowserRouter><AutomaticTestIds><LanguageProvider><ThemeProvider>
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/backlog" element={<BacklogPage />} />
        <Route path="/sprint-train" element={<SprintTrainPage />} />
        <Route path="/boards" element={<BoardDashboardPage />} />
        <Route path="/boards/:boardId" element={<BoardsPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/ai-estimator" element={<AiEstimatorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/project/:id/settings" element={<ProjectSettingsPage />} />
        <Route path="/project/:id/share" element={<ShareProjectPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  </ThemeProvider></LanguageProvider></AutomaticTestIds><ToastViewport /></BrowserRouter>;
}

export default App;
