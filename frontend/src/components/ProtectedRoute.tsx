import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { refreshAccessToken } from "../api/client";
import { getStoredUser } from "../store/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { pathname } = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const validateSession = async () => {
            const accessToken = sessionStorage.getItem("access_token");
            const refreshToken = sessionStorage.getItem("refresh_token");

            if (!accessToken && !refreshToken) {
                setIsAuthenticated(false);
                setIsChecking(false);
                return;
            }

            if (accessToken) {
                setIsAuthenticated(true);
                setIsChecking(false);
                return;
            }

            if (refreshToken) {
                const newAccessToken = await refreshAccessToken();
                setIsAuthenticated(!!newAccessToken);
                setIsChecking(false);
            }
        };

        validateSession();
    }, []);

    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const user = getStoredUser<{ job_title?: string }>();
    if (!user?.job_title?.trim() && pathname !== "/profile") {
        return <Navigate to="/profile" replace />;
    }

    return children;
}

export default ProtectedRoute;
