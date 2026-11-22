import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { refreshAccessToken } from "../api/client";
import { useAppDispatch, useAppSelector } from "../store";
import { sessionActions } from "../store/sessionSlice";
import { useTranslation } from "../shared/i18n/hooks/useTranslation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.session.authenticated);
  const user = useAppSelector((state) => state.session.user);
  const [isChecking, setIsChecking] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    const validateSession = async () => {
      const accessToken = sessionStorage.getItem("access_token");
      const refreshToken = sessionStorage.getItem("refresh_token");

      if (!accessToken && !refreshToken) {
        dispatch(sessionActions.authenticationChanged(false));
        setIsChecking(false);
        return;
      }

      if (accessToken) {
        dispatch(sessionActions.authenticationChanged(true));
        setIsChecking(false);
        return;
      }

      if (refreshToken) {
        const newAccessToken = await refreshAccessToken();
        dispatch(sessionActions.authenticationChanged(Boolean(newAccessToken)));
        setIsChecking(false);
      }
    };

    void validateSession().catch((cause: unknown) => {
      setSessionError(cause instanceof Error ? cause.message : "Could not verify your session.");
      setIsChecking(false);
    });
  }, [dispatch]);

  if (sessionError)
    return (
      <main className="p-8">
        <p role="alert">{sessionError}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {t("common.loading")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.job_title?.trim() && pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default ProtectedRoute;
