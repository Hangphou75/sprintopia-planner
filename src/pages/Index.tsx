
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  console.log("Index page - Auth state:", { user, isAuthenticated });

  if (isAuthenticated && user?.role === "individual_athlete") {
    console.log("Redirecting individual athlete to planning page");
    return <Navigate to="/individual-athlete/planning" replace />;
  }

  if (user?.role === "coach" || user?.role === "admin") {
    // Admin users are redirected to the coach interface to maintain coach functionality
    console.log("Redirecting coach/admin to coach dashboard");
    return <Navigate to="/coach" replace />;
  }

  if (user?.role === "athlete") {
    console.log("Redirecting athlete to athlete home");
    return <Navigate to="/athlete" replace />;
  }

  console.log("No valid role found, redirecting to login");
  return <Navigate to="/login" replace />;
};

export default Index;
