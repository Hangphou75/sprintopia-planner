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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        onProfileUpdate(null);
        return;
      }

      if (session?.user) {
        const cachedProfile = localStorage.getItem(`userProfile_${session.user.id}`);
        if (cachedProfile) {
          onProfileUpdate(JSON.parse(cachedProfile));
          setIsLoading(false);
        }
        
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          localStorage.setItem(`userProfile_${session.user.id}`, JSON.stringify(userProfile));
          onProfileUpdate(userProfile);
        }
      } else {
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

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isInitialized || !mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const cachedProfile = localStorage.getItem(`userProfile_${session.user.id}`);
        if (cachedProfile) {
          onProfileUpdate(JSON.parse(cachedProfile));
        }
        
        try {
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            if (userProfile) {
              localStorage.setItem(`userProfile_${session.user.id}`, JSON.stringify(userProfile));
              onProfileUpdate(userProfile);
            }
          }
        } catch (error) {
          console.error("Error fetching profile after sign in:", error);
          onProfileUpdate(null);
        }
      } else if (event === 'SIGNED_OUT' && mounted) {
        localStorage.removeItem('userProfile');
        onProfileUpdate(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, onProfileUpdate, isInitialized, initAuth]);

  return {
    isLoading,
    isInitialized
  };
};