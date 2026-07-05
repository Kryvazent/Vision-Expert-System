import { Spin } from "antd";
import { useAuth } from "../const/functions";
import { Navigate, useLocation } from "react-router";

/**
 * <ProtectedRoute allowedRoles={["accountant", "sales-executive"]}>
 *   <MyPage />
 * </ProtectedRoute>
 *
 * - No session        → redirect to /
 * - Wrong role        → redirect to the user's own home route
 * - allowedRoles omit → any authenticated user passes
 */

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isLoading, isAuthenticated, role, homeRoute, mustChangePassword } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={homeRoute} replace />;
  }

  return children;
}
