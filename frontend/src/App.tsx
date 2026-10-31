import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProfilePage from "./pages/ProfilePage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage";
import TeamPage from "./pages/TeamPage";
import RegisterPage from "./pages/RegisterPage";
import ShareProjectPage from "./pages/ShareProjectPage";
import UsersPage from "./pages/UsersPage";
import BacklogPage from "./pages/BacklogPage";
import BoardsPage from "./pages/BoardsPage";
import PortfolioPage from "./pages/PortfolioPage";
import DocumentsPage from "./pages/DocumentsPage";
import SettingsPage from "./pages/SettingsPage";
import { ThemeProvider } from "./features/settings/context/ThemeProvider";
import { LanguageProvider } from "./shared/i18n/context/LanguageProvider";
import { AutomaticTestIds } from "./shared/components/AutomaticTestIds";

function App() {
  return <BrowserRouter><AutomaticTestIds><LanguageProvider><ThemeProvider>
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/backlog" element={<BacklogPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/project/:id/share" element={<ShareProjectPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  </ThemeProvider></LanguageProvider></AutomaticTestIds></BrowserRouter>;
}

export default App;
