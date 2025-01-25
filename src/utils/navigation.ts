import { NavigateFunction } from "react-router-dom";
import { UserProfile } from "@/hooks/useProfile";

export const handleAuthRedirect = (userProfile: UserProfile | null, navigate: NavigateFunction) => {
  if (userProfile) {
    const redirectPath = `/${userProfile.role}/home`;
    console.log("Redirecting to:", redirectPath);
    navigate(redirectPath);
  } else {
    console.log("No profile, redirecting to login");
    navigate("/login");
  }
};