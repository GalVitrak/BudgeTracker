/**
 * Protected Route Component
 * Wraps routes that require authentication, redirecting to login if user is not authenticated
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../../Redux/AuthState";
import notifyService from "../../Services/NotifyService";

interface ProtectedRouteProps {
  /** The child components to render if authenticated */
  children: React.ReactNode;
}

/**
 * A wrapper component that protects routes requiring authentication
 * @param children - The components to render when authenticated
 * @returns The protected route component
 */
function ProtectedRoute({
  children,
}: ProtectedRouteProps): JSX.Element {
  const navigate = useNavigate();
  const uid = authStore.getState().user?.uid;

  // Check authentication on mount and uid changes
  useEffect(() => {
    if (!uid) {
      notifyService.error({
        message: "יש להתחבר למערכת תחילה",
      });
      navigate("/login");
    }
  }, [uid, navigate]);

  // Return empty div while checking auth or children if authenticated
  if (!uid) {
    return (
      <div className="protected-route-loading"></div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
