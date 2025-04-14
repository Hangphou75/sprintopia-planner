
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { authService } from "@/services/auth.service";
import { handleAuthRedirect } from "@/utils/navigation";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { profile, fetchProfile, setProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const refreshingRef = useRef(false);

  const handleProfileFetch = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!userId || !isMounted || refreshingRef.current) return null;
    
    refreshingRef.current = true;
    
    try {
      console.log("Fetching profile in useAuthState for user:", userId);
      const userProfile = await fetchProfile(userId);
      if (userProfile && isMounted) {
        setProfile(userProfile);
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    } finally {
      setTimeout(() => {
        refreshingRef.current = false;
      }, 300);
    }
  }, [fetchProfile, setProfile, isMounted]);

  // Function to handle visibility change (coming back to tab)
  const handleVisibilityChange = useCallback(async () => {
    if (document.visibilityState === 'visible' && isMounted && !refreshingRef.current) {
      console.log("Tab became visible, checking auth session in useAuthState");
      try {
        const session = await authService.getCurrentSession();
        if (session?.user) {
          await handleProfileFetch(session.user.id);
        }
      } catch (error) {
        console.error("Error checking session on visibility change:", error);
      }
    }
  }, [handleProfileFetch, isMounted]);

  // Handler for page reloads
  const handleBeforeUnload = useCallback(() => {
    console.log("Page reload detected in useAuthState");
    // Optionally you could save some state to localStorage here
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state in useAuthState");
        const session = await authService.getCurrentSession();
        
        if (session?.user && isMounted) {
          const userProfile = await handleProfileFetch(session.user.id);
          if (userProfile && isMounted) {
            handleAuthRedirect(userProfile, navigate);
          }
        } else if (isMounted) {
          setProfile(null);
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          setProfile(null);
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log("Auth state changed in useAuthState:", event);
      
      if (event === 'SIGNED_IN' && session?.user && !refreshingRef.current) {
        const userProfile = await handleProfileFetch(session.user.id);
        if (userProfile && isMounted) {
          handleAuthRedirect(userProfile, navigate);
        }
      } else if (event === 'SIGNED_OUT' && isMounted) {
        setProfile(null);
        navigate("/login");
      }
    });
    
    // Add visibility change listener to handle tab switching
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add beforeunload listener to detect page reloads
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Forcing loading state to finish after timeout in useAuthState");
        setIsLoading(false);
      }
    }, 1500); // Reduced timeout to 1.5 seconds

    return () => {
      setIsMounted(false);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timeoutId);
    };
  }, [
    navigate, 
    handleProfileFetch, 
    setProfile, 
    handleVisibilityChange, 
    handleBeforeUnload, 
    isLoading
  ]);

  return { isLoading };
};
