import { Spin } from "antd";
import { useAuth } from "../const/functions";
import { Navigate } from "react-router";

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
  const { isLoading, isAuthenticated, role, homeRoute } = useAuth();

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

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={homeRoute} replace />;
  }

  return children;
}