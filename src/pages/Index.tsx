
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  console.log("Index page - Auth state:", { user, isAuthenticated });

  if (isAuthenticated && user?.role === "individual_athlete") {
    console.log("Redirecting individual athlete to planning page");
    return <Navigate to="/individual-athlete/planning" replace />;
  }

  if (isAuthenticated && user?.role === "admin") {
    // Admin users should be redirected to admin pages
    console.log("Redirecting admin to admin dashboard");
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated && user?.role === "coach") {
    console.log("Redirecting coach to coach dashboard");
    return <Navigate to="/coach" replace />;
  }

  if (isAuthenticated && user?.role === "athlete") {
    console.log("Redirecting athlete to athlete home");
    return <Navigate to="/athlete" replace />;
  }

  console.log("No valid role found, redirecting to login");
  return <Navigate to="/login" replace />;
};

export default Index;
