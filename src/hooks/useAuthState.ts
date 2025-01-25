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
      console.log("Fetching profile for user:", userId);
      const userProfile = await fetchProfile(userId);
      
      if (userProfile) {
        console.log("Profile fetched successfully:", userProfile);
        setProfile(userProfile);
        return userProfile;
      }
      
      console.error("No profile found for user:", userId);
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        console.log("Current session in useAuthState:", session);
        
        if (session?.user && mounted) {
          console.log("Session user found, fetching profile...");
          const userProfile = await handleProfileFetch(session.user.id);
          
          if (userProfile && mounted) {
            console.log("Profile found, redirecting...");
            handleAuthRedirect(userProfile, navigate);
          } else {
            console.log("No profile found, redirecting to login");
            setProfile(null);
            navigate("/login", { replace: true });
          }
        } else {
          console.log("No session found, redirecting to login");
          setProfile(null);
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setProfile(null);
          navigate("/login", { replace: true });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user && mounted) {
        console.log("User signed in, fetching profile...");
        const userProfile = await handleProfileFetch(session.user.id);
        
        if (userProfile && mounted) {
          console.log("Profile found after sign in, redirecting...");
          handleAuthRedirect(userProfile, navigate);
        } else {
          console.log("No profile found after sign in");
          setProfile(null);
          navigate("/login", { replace: true });
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        console.log("User signed out");
        setProfile(null);
        navigate("/login", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, fetchProfile, setProfile]);

  return { isLoading };
};