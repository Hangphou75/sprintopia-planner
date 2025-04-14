
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './useProfile';

interface UseAuthInitProps {
  onProfileUpdate: (profile: UserProfile | null) => void;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
}

export const useAuthInit = ({ onProfileUpdate, fetchProfile }: UseAuthInitProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshingRef = useRef(false);

  const refreshSession = useCallback(async () => {
    // Prevent multiple refresh attempts
    if (refreshingRef.current) {
      console.log("Session refresh already in progress, skipping");
      return null;
    }

    refreshingRef.current = true;
    
    try {
      console.log("Refreshing session in useAuthInit");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error during refresh:", sessionError);
        onProfileUpdate(null);
        return null;
      }

      if (session?.user) {
        try {
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            console.log("Profile refreshed in useAuthInit:", userProfile.role);
            onProfileUpdate(userProfile);
            return userProfile;
          }
        } catch (error) {
          console.error("Error refreshing profile in useAuthInit:", error);
        }
      } else {
        console.log("No session found during refresh");
        onProfileUpdate(null);
      }
      
      return null;
    } catch (error) {
      console.error("Error in refreshSession:", error);
      return null;
    } finally {
      refreshingRef.current = false;
    }
  }, [fetchProfile, onProfileUpdate]);

  const initAuth = useCallback(async () => {
    try {
      console.log("Initializing auth state...");
      await refreshSession();
    } catch (error) {
      console.error("Auth initialization error:", error);
      onProfileUpdate(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [refreshSession, onProfileUpdate]);

  // Handler for visibility change
  const handleVisibilityChange = useCallback(async () => {
    if (document.visibilityState === 'visible' && isInitialized) {
      console.log("Tab became visible, refreshing session in useAuthInit");
      await refreshSession();
    }
  }, [refreshSession, isInitialized]);

  // Handler for page reload
  const handlePageReload = useCallback(() => {
    console.log("Page reload detected");
    setIsLoading(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Initial auth check
    initAuth();
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Monitor page reloads
    window.addEventListener('beforeunload', handlePageReload);
    
    // Force loading state to finish after timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.log("Forcing loading state to finish after timeout in useAuthInit");
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 1500); // Reduced timeout to 1.5 seconds

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handlePageReload);
      clearTimeout(timeoutId);
    };
  }, [initAuth, isLoading, handleVisibilityChange, handlePageReload]);

  return {
    isLoading,
    isInitialized,
    refreshSession
  };
};
