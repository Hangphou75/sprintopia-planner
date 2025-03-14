
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log("Index page - Auth state:", { 
    user, 
    userRole: user?.role,
    isAuthenticated, 
    isLoading 
  });

  // Wait until authentication is verified before redirecting, but not forever
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
      console.log("Redirecting individual athlete to planning page");
      return <Navigate to="/individual-athlete/planning" replace />;
    }

    if (user.role === "admin") {
      console.log("Redirecting admin to users management page");
      return <Navigate to="/admin/users" replace />;
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

  // If the user is not authenticated or has no role, always redirect to login
  console.log("No authenticated user detected, redirecting to login");
  return <Navigate to="/login" replace />;
};

export default Index;
