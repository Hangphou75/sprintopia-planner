
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
        return;
      }

      if (session?.user) {
        console.log("Found existing session for user:", session.user.id);
        // Clear loading early for a better UX
        setIsLoading(true);
        
        const cachedProfile = localStorage.getItem(`userProfile_${session.user.id}`);
        if (cachedProfile) {
          const parsedProfile = JSON.parse(cachedProfile);
          console.log("Using cached profile with role:", parsedProfile.role);
          onProfileUpdate(parsedProfile);
        }
        
        try {
          console.log("Fetching fresh profile data");
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            console.log("Profile data retrieved successfully with role:", userProfile.role);
            localStorage.setItem(`userProfile_${session.user.id}`, JSON.stringify(userProfile));
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

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (!mounted) {
        console.log("Component unmounted, ignoring auth change");
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User signed in, updating profile");
        setIsLoading(true);
        
        try {
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            if (userProfile) {
              console.log("Profile loaded after sign in with role:", userProfile.role);
              localStorage.setItem(`userProfile_${session.user.id}`, JSON.stringify(userProfile));
              onProfileUpdate(userProfile);
            } else {
              console.log("No profile found for signed in user");
              onProfileUpdate(null);
            }
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error fetching profile after sign in:", error);
          if (mounted) {
            onProfileUpdate(null);
            setIsLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing profile");
        if (mounted) {
          localStorage.removeItem('userProfile');
          onProfileUpdate(null);
          setIsLoading(false);
        }
      } else if (event === 'INITIAL_SESSION') {
        console.log("Initial session event received", session ? "with session" : "without session");
        if (mounted && !session) {
          onProfileUpdate(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, onProfileUpdate, isInitialized, initAuth]);

  return {
    isLoading,
    isInitialized
  };
};
