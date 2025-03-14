
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user } = useAuth();
  
  console.log("RoleProtectedRoute - Current user:", user?.role, "Allowed roles:", allowedRoles);

  // Admins have access to all routes
  if (user?.role === "admin") {
    console.log("Admin access granted to route");
    return <Outlet />;
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    console.log("Access denied for role:", user?.role);
    return <Navigate to="/login" replace />;
  }

  console.log("Access granted for role:", user?.role);
  return <Outlet />;
};
