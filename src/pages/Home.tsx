
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

  // Wait until authentication is verified before redirecting, but don't wait too long
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
    if (user.role === "individual_athlete") {
      return <Navigate to="/individual-athlete/planning" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin/users" replace />;
    }

    if (user.role === "coach") {
      return <Navigate to="/coach" replace />;
    }

    if (user.role === "athlete") {
      return <Navigate to="/athlete/planning" replace />;
    }
  }

  // Always redirect to login if not authenticated
  return <Navigate to="/login" replace />;
}
