
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log("RoleProtectedRoute - Current user:", user?.role, "Allowed roles:", allowedRoles, "isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

  // Wait for authentication to complete
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  // Admins have access to all routes
  if (user?.role === "admin") {
    console.log("Admin access granted to route");
    return <Outlet />;
  }

  if (!isAuthenticated || !user || !user.role || !allowedRoles.includes(user.role)) {
    console.log("Access denied for role:", user?.role);
    return <Navigate to="/login" replace />;
  }

  console.log("Access granted for role:", user.role);
  return <Outlet />;
};
