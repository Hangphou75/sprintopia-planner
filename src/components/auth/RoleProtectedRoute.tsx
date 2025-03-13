
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user } = useAuth();

  // Les admins ont accès à toutes les routes
  if (user?.role === "admin") {
    // Si la route est pour le coach, permettre l'accès car les admins doivent 
    // avoir accès aux fonctionnalités coach
    return <Outlet />;
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
