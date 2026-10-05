import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { refreshAccessToken } from "../utils/api";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
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

    return children;
}

export default ProtectedRoute;