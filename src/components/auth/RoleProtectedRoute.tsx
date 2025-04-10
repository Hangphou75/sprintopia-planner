
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
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

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Admins have access to all routes 
  if (user?.role === "admin") {
    console.log("Admin access granted to route");
    return <Outlet />;
  }

  // If authenticated but role doesn't match, deny access
  if (!user.role || !allowedRoles.includes(user.role)) {
    console.log("Access denied for role:", user?.role);
    
    // Redirect to appropriate page based on user role
    if (user.role === "individual_athlete") {
      return <Navigate to="/individual-athlete" replace />;
    } else if (user.role === "coach") {
      return <Navigate to="/coach" replace />;
    } else if (user.role === "athlete") {
      return <Navigate to="/athlete" replace />;
    } else {
      // Fallback to login if role is unknown
      return <Navigate to="/login" replace />;
    }
  }

  console.log("Access granted for role:", user.role);
  return <Outlet />;
};
