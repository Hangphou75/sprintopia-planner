
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthInit } from "@/hooks/useAuthInit";

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUserProfile: (userId: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, setProfile, fetchProfile } = useProfile();
  const { login: authLogin, logout: authLogout, isLoading: sessionLoading } = useAuthSession();
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const refreshingRef = useRef(false);

  // Function to handle profile refresh with debounce
  const refreshUserProfile = async (userId: string) => {
    if (!userId || refreshingRef.current) return null;
    
    refreshingRef.current = true;
    
    try {
      console.log("Refreshing profile for user:", userId);
      const userProfile = await fetchProfile(userId);
      if (userProfile) {
        console.log("Profile refreshed successfully:", userProfile.role);
        setProfile(userProfile);
        return userProfile;
      } else {
        console.log("No profile found during refresh");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return null;
    } finally {
      // Reset the refreshing flag after a short delay
      setTimeout(() => {
        refreshingRef.current = false;
      }, 300);
    }
  };

  // Initialize auth and handle session refreshes
  const { isLoading: authInitLoading, refreshSession } = useAuthInit({
    onProfileUpdate: setProfile,
    fetchProfile
  });

  // Set up auth state listener and handle initial auth check
  useEffect(() => {
    let isMounted = true;
    let visibilityChangeHandler: null | ((e: Event) => void) = null;
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          if (!refreshingRef.current) {
            await refreshUserProfile(session.user.id);
          }
        } catch (error) {
          console.error("Error fetching profile after state change:", error);
        }
      } else if (event === 'SIGNED_OUT' && isMounted) {
        setProfile(null);
      }
    });
    
    // Function to handle visibility change (tab switch)
    visibilityChangeHandler = async () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, checking auth session");
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user?.id && !refreshingRef.current) {
            await refreshUserProfile(data.session.user.id);
          }
        } catch (error) {
          console.error("Error handling visibility change:", error);
        }
      }
    };
    
    // Add visibility change listener to handle tab switching
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    
    // Force initialization to prevent infinite loading
    const timer = setTimeout(() => {
      if (isMounted && isInitLoading) {
        console.log("Forcing initialization after timeout");
        setInitialized(true);
        setIsInitLoading(false);
      }
    }, 1500); // Reduced timeout to 1.5 seconds
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      
      if (visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
      }
      clearTimeout(timer);
    };
  }, [fetchProfile, setProfile, isInitLoading, refreshUserProfile]);

  useEffect(() => {
    setIsInitLoading(authInitLoading);
  }, [authInitLoading]);

  console.log("AuthProvider - Current state:", { 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    isLoading: isInitLoading || sessionLoading || !initialized,
    initialized
  });

  const login = async (email: string, password: string, role: string) => {
    try {
      await authLogin(email, password, role);
      toast.success("Connexion réussie");
    } catch (error) {
      console.error("Login error in context:", error);
      toast.error("Échec de la connexion");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setProfile(null);
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Logout error in context:", error);
      toast.error("Échec de la déconnexion");
      throw error;
    }
  };

  const value = {
    user: profile,
    login,
    logout,
    isAuthenticated: !!profile,
    isLoading: (isInitLoading || sessionLoading || !initialized),
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
