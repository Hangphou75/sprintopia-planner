import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { authService } from "@/services/auth.service";
import { handleAuthRedirect } from "@/utils/navigation";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { profile, fetchProfile, setProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  const handleProfileFetch = async (userId: string): Promise<UserProfile | null> => {
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

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('refresh_token_not_found') || 
        errorMessage.includes('invalid token') || 
        errorMessage.includes('jwt expired')) {
      console.log("Session invalid, clearing and redirecting to login");
      await authService.logout();
      setProfile(null);
      navigate("/login", { replace: true });
      toast.error("Session expirée, veuillez vous reconnecter");
    } else {
      console.error("Unexpected auth error:", error);
      toast.error("Une erreur est survenue, veuillez réessayer");
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session?.user) {
          const userProfile = await handleProfileFetch(session.user.id);
          handleAuthRedirect(userProfile, navigate);
        }
      } catch (error) {
        await handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await handleProfileFetch(session.user.id);
          if (!userProfile) {
            toast.error("Erreur lors de la récupération du profil");
            await authService.logout();
          }
          handleAuthRedirect(userProfile, navigate);
        } catch (error) {
          await handleAuthError(error);
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log("User signed out or token refreshed");
        setProfile(null);
        handleAuthRedirect(null, navigate);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, fetchProfile, setProfile]);

  return { isLoading };
};