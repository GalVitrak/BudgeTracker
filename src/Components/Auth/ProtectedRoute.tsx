import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../../Redux/AuthState";
import notifyService from "../../Services/NotifyService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps): JSX.Element {
  const navigate = useNavigate();
  const uid = authStore.getState().user?.uid;

  useEffect(() => {
    if (!uid) {
      notifyService.error({
        message: "יש להתחבר למערכת תחילה",
      });
      navigate("/login");
    }
  }, [uid, navigate]);

  if (!uid) {
    return <div></div>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
