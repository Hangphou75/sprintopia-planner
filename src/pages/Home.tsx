
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log("Home page - Auth state:", { user, isAuthenticated, isLoading });

  // Wait until authentication is verified before redirecting
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  // If the user is authenticated, redirect according to their role
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

  // If the user is not authenticated, redirect to the login page
  return <Navigate to="/login" replace />;
}
