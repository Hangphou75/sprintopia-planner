
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log("Index page - Auth state:", { user, isAuthenticated, isLoading });

  // Attendre que l'authentification soit vérifiée avant de rediriger
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  // Si l'utilisateur est authentifié, rediriger selon son rôle
  if (isAuthenticated && user?.role) {
    if (user.role === "individual_athlete") {
      console.log("Redirecting individual athlete to planning page");
      return <Navigate to="/individual-athlete/planning" replace />;
    }

    if (user.role === "admin") {
      console.log("Redirecting admin to admin dashboard");
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "coach") {
      console.log("Redirecting coach to coach dashboard");
      return <Navigate to="/coach" replace />;
    }

    if (user.role === "athlete") {
      console.log("Redirecting athlete to athlete home");
      return <Navigate to="/athlete" replace />;
    }
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de login
  console.log("No valid authenticated user, redirecting to login");
  return <Navigate to="/login" replace />;
};

export default Index;
