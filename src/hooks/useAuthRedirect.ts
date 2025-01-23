import { useNavigate } from "react-router-dom";
import { UserProfile } from "./useProfile";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  const handleRedirect = (userProfile: UserProfile | null) => {
    if (userProfile) {
      const redirectPath = `/${userProfile.role}/home`;
      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } else {
      console.log("No profile, redirecting to login");
      navigate("/login", { replace: true });
    }
  };

  return { handleRedirect };
};