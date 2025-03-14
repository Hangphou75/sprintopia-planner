
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './useProfile';

interface UseAuthInitProps {
  onProfileUpdate: (profile: UserProfile | null) => void;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
}

export const useAuthInit = ({ onProfileUpdate, fetchProfile }: UseAuthInitProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const initAuth = useCallback(async () => {
    try {
      console.log("Initializing auth state...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        onProfileUpdate(null);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      if (session?.user) {
        console.log("Found existing session for user:", session.user.id);
        
        try {
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            console.log("Profile data retrieved successfully with role:", userProfile.role);
            onProfileUpdate(userProfile);
          } else {
            console.log("No profile data found despite valid session");
            onProfileUpdate(null);
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
          onProfileUpdate(null);
        }
      } else {
        console.log("No active session found");
        onProfileUpdate(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      onProfileUpdate(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [fetchProfile, onProfileUpdate]);

  useEffect(() => {
    let mounted = true;
    
    // Initial auth check
    initAuth();
    
    // Force loading state to finish after 3 seconds to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.log("Forcing loading state to finish after timeout");
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [initAuth, isLoading]);

  return {
    isLoading,
    isInitialized
  };
};
