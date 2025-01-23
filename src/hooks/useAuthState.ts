import { useState } from "react";
import { UserProfile } from "./useProfile";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export const useAuthState = (
  fetchProfile: (userId: string) => Promise<UserProfile | null>,
  setProfile: (profile: UserProfile | null) => void
) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleProfileFetch = async (userId: string) => {
    try {
      const userProfile = await fetchProfile(userId);
      if (userProfile) {
        console.log("Profile fetched successfully:", userProfile);
        return userProfile;
      }
      console.error("No profile found for user:", userId);
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const handleAuthStateChange = async (event: string, userId: string | undefined) => {
    if (event === 'SIGNED_IN' && userId) {
      const userProfile = await handleProfileFetch(userId);
      if (!userProfile) {
        toast.error("Erreur lors de la récupération du profil");
        await authService.logout();
      }
      return userProfile;
    } else if (event === 'SIGNED_OUT') {
      console.log("User signed out");
      setProfile(null);
      return null;
    }
    return null;
  };

  const initializeAuth = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (session?.user) {
        return await handleProfileFetch(session.user.id);
      }
    } catch (error) {
      console.error("Error during auth initialization:", error);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  return {
    isLoading,
    handleAuthStateChange,
    initializeAuth,
  };
};