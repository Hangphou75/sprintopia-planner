import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { authService } from "@/services/auth.service";
import { handleAuthRedirect } from "@/utils/navigation";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { profile, fetchProfile, setProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  const handleProfileFetch = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    
    try {
      const userProfile = await fetchProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, [fetchProfile, setProfile]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        
        if (session?.user && mounted) {
          const userProfile = await handleProfileFetch(session.user.id);
          if (userProfile && mounted) {
            handleAuthRedirect(userProfile, navigate);
          }
        } else if (mounted) {
          setProfile(null);
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setProfile(null);
          navigate("/login");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        const userProfile = await handleProfileFetch(session.user.id);
        if (userProfile && mounted) {
          handleAuthRedirect(userProfile, navigate);
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        setProfile(null);
        navigate("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, handleProfileFetch, setProfile]);

  return { isLoading };
};