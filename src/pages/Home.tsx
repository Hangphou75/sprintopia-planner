
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log("Home page - Auth state:", { 
    user, 
    userRole: user?.role, 
    isAuthenticated, 
    isLoading 
  });

  // Wait until authentication is verified before redirecting
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
  
  // If the user is authenticated, redirect according to their role
  if (isAuthenticated && user?.role) {
    console.log("Redirecting authenticated user with role:", user.role);
    
    if (user.role === "individual_athlete") {
      return <Navigate to="/individual-athlete/planning" replace />;
    }

    if (user.role === "admin") {
      console.log("Admin user detected, redirecting to admin users page");
      return <Navigate to="/admin/users" replace />;
    }

    if (user.role === "coach") {
      return <Navigate to="/coach/dashboard" replace />;
    }

    if (user.role === "athlete") {
      return <Navigate to="/athlete/planning" replace />;
    }
  }

  // If not authenticated, redirect to login
  console.log("User not authenticated, redirecting to login");
  return <Navigate to="/login" replace />;
}
