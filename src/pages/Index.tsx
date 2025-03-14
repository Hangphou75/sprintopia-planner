
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log("Index page - Auth state:", { user, isAuthenticated, isLoading });

  // Wait until authentication is verified before redirecting
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  // If the user is authenticated, redirect according to their role
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

  // If the user is not authenticated, redirect to the login page
  console.log("No valid authenticated user, redirecting to login");
  return <Navigate to="/login" replace />;
};

export default Index;
