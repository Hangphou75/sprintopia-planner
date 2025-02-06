
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  if (user?.role === "individual_athlete") {
    return <Navigate to="/individual-athlete/planning" replace />;
  }

  if (user?.role === "coach") {
    return <Navigate to="/coach" replace />;
  }

  if (user?.role === "athlete") {
    return <Navigate to="/athlete" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
