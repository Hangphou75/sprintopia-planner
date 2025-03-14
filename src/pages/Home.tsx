
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log("Home page - Auth state:", { user, isAuthenticated, isLoading });

  // Attendre que l'authentification soit vérifiée avant de rediriger
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  // Si l'utilisateur est authentifié, rediriger selon son rôle
  if (isAuthenticated && user?.role) {
    if (user.role === "individual_athlete") {
      return <Navigate to="/individual-athlete/planning" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "coach") {
      return <Navigate to="/coach" replace />;
    }

    if (user.role === "athlete") {
      return <Navigate to="/athlete/planning" replace />;
    }
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de login
  return <Navigate to="/login" replace />;
}
