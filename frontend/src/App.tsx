import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Register from './Pages/Register/Register';
import Login from './Pages/Login/Login';
import Dashboard from './Pages/Dashboard/Dashboard';
import ProjectDetail from './Pages/ProjectDetail/ProjectDetail';
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectSidebar from "./Pages/ProjectDetail/components/ProjectSidebar";

function App(){
  return(
    <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-100 md:grid md:grid-cols-[250px_minmax(0,1fr)]">
                <ProjectSidebar />
                <Outlet />
              </div>
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Dashboard title="Projects" />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/register" replace />} />

        </Routes>
    </BrowserRouter>
   
  )
}


export default App;

