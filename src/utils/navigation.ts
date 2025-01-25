import { NavigateFunction } from "react-router-dom";
import { UserProfile } from "@/hooks/useProfile";

export const handleAuthRedirect = (userProfile: UserProfile | null, navigate: NavigateFunction) => {
  if (!userProfile) {
    navigate("/login");
    return;
  }

  const path = `/${userProfile.role}/home`;
  if (window.location.pathname !== path) {
    navigate(path);
  }
};