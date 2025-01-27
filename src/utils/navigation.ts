import { NavigateFunction } from "react-router-dom";
import { UserProfile } from "@/hooks/useProfile";

export const handleAuthRedirect = (userProfile: UserProfile | null, navigate: NavigateFunction) => {
  if (!userProfile) {
    console.log("No user profile, redirecting to login");
    navigate("/login");
    return;
  }

  console.log("Redirecting user with role:", userProfile.role);
  const path = `/${userProfile.role}`;
  
  // Only redirect if we're not already on a valid path
  if (!window.location.pathname.startsWith(path)) {
    console.log("Redirecting to:", path);
    navigate(path);
  } else {
    console.log("Already on a valid path:", window.location.pathname);
  }
};