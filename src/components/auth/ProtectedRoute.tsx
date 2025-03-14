
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute - Current state:", { isAuthenticated, isLoading, path: location.pathname });
  
  // Si l'authentification est en cours, afficher un chargement
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

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login from ProtectedRoute");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // L'utilisateur est authentifié, on peut afficher le contenu protégé
  return <Outlet />;
};
