
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  if (isAuthenticated && user?.role === "individual_athlete") {
    return <Navigate to="/individual-athlete/planning" replace />;
  }

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated && user?.role === "coach") {
    return <Navigate to="/coach" replace />;
  }

  if (isAuthenticated && user?.role === "athlete") {
    return <Navigate to="/athlete/planning" replace />;
  }

  return <Navigate to="/login" replace />;
}
